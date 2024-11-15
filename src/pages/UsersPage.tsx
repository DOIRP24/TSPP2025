import React, { useMemo } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { UserCard } from '../components/UserCard';
import { useUsers } from '../hooks/useUsers';
import { TelegramUser, UserProfile } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { SkeletonUserCard } from '../components/SkeletonUserCard';

interface UsersPageProps {
  currentUser: TelegramUser | null;
  isAdmin: boolean;
}

export function UsersPage({ currentUser, isAdmin }: UsersPageProps) {
  const { users, loading, error } = useUsers();
  const location = useLocation();
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;

  React.useEffect(() => {
    if (location.pathname !== '/' && tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/'));
    }
    return () => {
      if (tg) {
        tg.BackButton.hide();
        tg.BackButton.offClick();
      }
    };
  }, [location.pathname, tg, navigate]);

  const { participants, organizers } = useMemo(() => {
    return {
      participants: users.filter(user => user.role !== 'organizer'),
      organizers: users.filter(user => user.role === 'organizer')
    };
  }, [users]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {location.pathname !== '/' && (
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Назад
        </button>
      )}

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Рейтинг участников</h1>
          <Trophy className="w-8 h-8 text-yellow-300" />
        </div>
        <p className="text-blue-100 mt-2">
          Соревнуйтесь и зарабатывайте баллы!
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Участники</h2>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <SkeletonUserCard key={i} />
            ))
          ) : participants.length > 0 ? (
            participants.map((user, index) => (
              <div key={user.id} className="relative animate-fadeIn">
                {index < 3 && (
                  <div 
                    className="absolute -left-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" 
                    style={{
                      backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                      color: index === 0 ? '#000' : '#FFF'
                    }}
                  >
                    {index + 1}
                  </div>
                )}
                <UserCard 
                  user={user} 
                  isCurrentUser={currentUser ? user.id === currentUser.id.toString() : false}
                  currentUserIsAdmin={isAdmin}
                />
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              Пока нет участников
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Организаторы</h2>
          {loading ? (
            <SkeletonUserCard />
          ) : organizers.length > 0 ? (
            organizers.map((user) => (
              <UserCard 
                key={user.id}
                user={user} 
                isCurrentUser={currentUser ? user.id === currentUser.id.toString() : false}
                currentUserIsAdmin={isAdmin}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              Пока нет организаторов
            </div>
          )}
        </div>
      </div>
    </div>
  );
}