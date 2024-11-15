import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

const ADMIN_USERNAME = 'admin';
const USERS_CACHE_KEY = 'users_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const USERS_LIMIT = 50; // Limit number of users fetched

function processUserData(doc: any): UserProfile {
  try {
    const data = doc.data();
    return {
      id: doc.id,
      username: data.username || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      photoUrl: data.photoUrl || '',
      points: Number(data.points || 0),
      visitCount: Number(data.visitCount || 0),
      lastVisit: data.lastVisit?.toDate() || new Date(),
      lastActive: data.lastActive?.toDate() || new Date(),
      isOnline: Boolean(data.isOnline),
      isAdmin: Boolean(data.isAdmin),
      role: data.role || 'participant',
      streak: Number(data.streak || 0),
      likes: data.likes || [],
      likedBy: data.likedBy || []
    };
  } catch (error) {
    console.error('Error processing user data:', error);
    return {
      id: doc.id,
      username: '',
      firstName: '',
      lastName: '',
      photoUrl: '',
      points: 0,
      visitCount: 0,
      lastVisit: new Date(),
      lastActive: new Date(),
      isOnline: false,
      isAdmin: false,
      role: 'participant',
      streak: 0,
      likes: [],
      likedBy: []
    };
  }
}

// Singleton pattern for users subscription
let globalUsersSubscription: {
  users: UserProfile[];
  subscribers: Set<(users: UserProfile[]) => void>;
  unsubscribe?: () => void;
  lastUpdate?: number;
} | null = null;

function getCachedUsers(): UserProfile[] | null {
  try {
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
      localStorage.removeItem(USERS_CACHE_KEY);
    }
  } catch (error) {
    localStorage.removeItem(USERS_CACHE_KEY);
  }
  return null;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>(() => getCachedUsers() || []);
  const [loading, setLoading] = useState(!users.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Initialize or use existing subscription
    if (!globalUsersSubscription || 
        (globalUsersSubscription.lastUpdate && 
         Date.now() - globalUsersSubscription.lastUpdate > CACHE_DURATION)) {
      
      globalUsersSubscription = {
        users: [],
        subscribers: new Set(),
        lastUpdate: Date.now()
      };

      const q = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(USERS_LIMIT)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const usersData = snapshot.docs
              .map(processUserData)
              .filter(user => 
                user.username !== ADMIN_USERNAME && 
                user.firstName && 
                user.lastName
              );

            // Update cache
            localStorage.setItem(USERS_CACHE_KEY, JSON.stringify({
              data: usersData,
              timestamp: Date.now()
            }));

            if (globalUsersSubscription) {
              globalUsersSubscription.users = usersData;
              globalUsersSubscription.subscribers.forEach(callback => callback(usersData));
            }
          } catch (error) {
            console.error('Error processing users data:', error);
            setError('Ошибка обработки данных пользователей');
          }
        },
        (error) => {
          console.error('Error fetching users:', error);
          if (isMounted) {
            setError('Ошибка загрузки пользователей. Пожалуйста, попробуйте позже.');
            setLoading(false);
            
            // Use cached data if available
            const cachedUsers = getCachedUsers();
            if (cachedUsers) {
              setUsers(cachedUsers);
            }
          }
        }
      );

      globalUsersSubscription.unsubscribe = unsubscribe;
    }

    const updateUsers = (newUsers: UserProfile[]) => {
      if (isMounted) {
        setUsers(newUsers);
        setLoading(false);
        setError(null);
      }
    };

    globalUsersSubscription.subscribers.add(updateUsers);

    // Initial state
    if (globalUsersSubscription.users.length > 0) {
      updateUsers(globalUsersSubscription.users);
    }

    return () => {
      isMounted = false;
      if (globalUsersSubscription) {
        globalUsersSubscription.subscribers.delete(updateUsers);

        // Cleanup if no more subscribers
        if (globalUsersSubscription.subscribers.size === 0) {
          globalUsersSubscription.unsubscribe?.();
          globalUsersSubscription = null;
        }
      }
    };
  }, []);

  return { users, loading, error };
}