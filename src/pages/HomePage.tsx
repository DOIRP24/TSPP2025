import React, { useEffect, useState } from 'react';
import { TelegramUser, UserProfile } from '../types';
import { UserCard } from '../components/UserCard';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WelcomeLoader } from '../components/WelcomeLoader';
import { useProfile } from '../hooks/useProfile';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface HomePageProps {
  currentUser: TelegramUser | null;
}

export function HomePage({ currentUser }: HomePageProps) {
  const { profile, loading } = useProfile(currentUser);
  const [randomProfile, setRandomProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useOnlineStatus(currentUser?.id?.toString() || null);

  useEffect(() => {
    const fetchRandomProfile = async () => {
      if (currentUser?.is_admin) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(
            usersRef, 
            where('role', '==', 'participant'),
            limit(10) // Limit to improve performance
          );
          
          const snapshot = await getDocs(q);
          const participants = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
            .filter(user => user.firstName && user.lastName);

          if (participants.length > 0) {
            const randomIndex = Math.floor(Math.random() * participants.length);
            setRandomProfile(participants[randomIndex]);
          }
        } catch (error) {
          console.error('Error fetching random profile:', error);
          setError('Не удалось загрузить профиль участника');
        }
      }
    };

    fetchRandomProfile();
  }, [currentUser?.is_admin]);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Пожалуйста, откройте приложение через Telegram.</p>
      </div>
    );
  }

  if (loading) {
    return <WelcomeLoader />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // For admin, show random participant's profile
  if (currentUser.is_admin && randomProfile) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <UserCard 
          user={randomProfile}
          isCurrentUser={false}
          currentUserIsAdmin={true}
        />
      </div>
    );
  }

  // For regular users, show their own profile
  return (
    <div className="space-y-6 animate-fadeIn">
      {profile && (
        <UserCard 
          user={{
            ...profile,
            firstName: currentUser.first_name,
            lastName: currentUser.last_name || '',
            photoUrl: currentUser.photo_url || '',
            username: currentUser.username ? `@${currentUser.username}` : '',
            isAdmin: currentUser.is_admin
          }}
          isCurrentUser 
          currentUserIsAdmin={currentUser.is_admin}
        />
      )}
    </div>
  );
}