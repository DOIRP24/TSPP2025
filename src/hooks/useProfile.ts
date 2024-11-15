import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { TelegramUser, UserProfile } from '../types';

const BASE_POINTS = 10;
const CACHE_KEY = 'cached_profile';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function useProfile(currentUser: TelegramUser | null) {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (error) {
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  });
  
  const [loading, setLoading] = useState(!profile);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const userId = currentUser.id.toString();
    const userRef = doc(db, 'users', userId);

    const loadProfile = async () => {
      try {
        const docSnap = await getDoc(userRef);
        
        if (!isMounted) return;

        let profileData: UserProfile;
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          profileData = {
            id: docSnap.id,
            username: currentUser.username ? `@${currentUser.username}` : '',
            firstName: currentUser.first_name,
            lastName: currentUser.last_name || '',
            photoUrl: currentUser.photo_url || '',
            points: Number(userData.points || 0),
            visitCount: Number(userData.visitCount || 0),
            lastVisit: userData.lastVisit?.toDate() || new Date(),
            lastActive: new Date(),
            isAdmin: Boolean(currentUser.is_admin),
            role: userData.role || 'participant',
            streak: Number(userData.streak || 0)
          };
        } else {
          profileData = {
            id: userId,
            username: currentUser.username ? `@${currentUser.username}` : '',
            firstName: currentUser.first_name,
            lastName: currentUser.last_name || '',
            photoUrl: currentUser.photo_url || '',
            points: BASE_POINTS,
            visitCount: 1,
            lastVisit: new Date(),
            lastActive: new Date(),
            isAdmin: Boolean(currentUser.is_admin),
            role: 'participant',
            streak: 1
          };

          await setDoc(userRef, {
            ...profileData,
            lastVisit: serverTimestamp(),
            lastActive: serverTimestamp()
          });
        }

        // Cache the profile
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: profileData,
          timestamp: Date.now()
        }));

        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!profile) {
      loadProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser, profile]);

  return { profile, loading };
}