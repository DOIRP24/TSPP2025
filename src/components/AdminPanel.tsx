import React, { useState } from 'react';
import { UserProfile, AdminAction } from '../types';
import { doc, updateDoc, increment, serverTimestamp, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Settings, Plus, Trash, Users, UserPlus, Shield, RefreshCw } from 'lucide-react';
import { presetUserData } from '../utils/presetUserData';

interface AdminPanelProps {
  user: UserProfile;
  currentUserIsAdmin: boolean;
}

const ADMIN_USERNAME = 'admin';

export function AdminPanel({ user, currentUserIsAdmin }: AdminPanelProps) {
  const [showActions, setShowActions] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!currentUserIsAdmin || (user.username === ADMIN_USERNAME && user.isAdmin)) {
    return null;
  }

  const handleResetAllUsers = async () => {
    if (!window.confirm('Вы уверены? Это действие удалит ВСЕ данные пользователей и не может быть отменено!')) {
      return;
    }

    setIsResetting(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      // Reset all users except admin to default state instead of deleting
      const resetPromises = snapshot.docs
        .filter(doc => doc.data().username !== ADMIN_USERNAME)
        .map(doc => updateDoc(doc.ref, {
          points: 0,
          visitCount: 0,
          lastVisit: serverTimestamp(),
          lastActive: serverTimestamp(),
          role: 'participant',
          isAdmin: false
        }));
      
      await Promise.all(resetPromises);
      
      // Clear only specific localStorage items
      localStorage.removeItem('last_visit_timestamp');
      localStorage.removeItem('cached_profile');
      
      alert('Все данные пользователей успешно сброшены');
    } catch (error) {
      console.error('Error resetting all users:', error);
      alert('Произошла ошибка при сбросе данных');
    } finally {
      setIsResetting(false);
    }
  };

  const handleAction = async (action: AdminAction) => {
    const userRef = doc(db, 'users', user.id);

    try {
      switch (action.type) {
        case 'ADD_POINTS':
          await updateDoc(userRef, {
            points: increment(action.points || 0)
          });
          break;
        case 'RESET_STATS':
          await updateDoc(userRef, {
            points: 0,
            visitCount: 0,
            lastVisit: serverTimestamp(),
            lastActive: serverTimestamp(),
            role: 'participant'
          });
          localStorage.removeItem('last_visit_timestamp');
          break;
        case 'SET_ROLE':
          await updateDoc(userRef, {
            role: action.role || 'participant',
            isAdmin: user.username === ADMIN_USERNAME
          });
          break;
        case 'UPDATE_USER_DATA':
          if (action.presetData) {
            await updateDoc(userRef, {
              firstName: action.presetData.firstName,
              lastName: action.presetData.lastName,
              photoUrl: action.presetData.photoUrl,
              role: 'participant'
            });
          }
          break;
        case 'MAKE_ADMIN':
          await updateDoc(userRef, {
            isAdmin: true,
            role: 'organizer'
          });
          break;
      }
    } catch (error) {
      console.error('Error performing admin action:', error);
    }
  };

  const handlePresetSelect = async (username: string) => {
    const presetData = presetUserData[username];
    if (presetData) {
      await handleAction({ 
        type: 'UPDATE_USER_DATA', 
        presetData 
      });
      setShowPresets(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setShowActions(!showActions)}
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
      >
        <Settings className="w-4 h-4 mr-1" />
        Управление
      </button>

      {showActions && (
        <div className="mt-2 space-y-2">
          <div className="flex space-x-2">
            {[5, 10, 50, 100].map((points) => (
              <button
                key={points}
                onClick={() => handleAction({ type: 'ADD_POINTS', points })}
                className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                {points}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Установить данные
            </button>

            <button
              onClick={() => handleAction({ type: 'SET_ROLE', role: 'organizer' })}
              className="px-2 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center"
            >
              <Users className="w-3 h-3 mr-1" />
              Организатор
            </button>

            <button
              onClick={() => handleAction({ type: 'MAKE_ADMIN' })}
              className="px-2 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center"
            >
              <Shield className="w-3 h-3 mr-1" />
              Сделать админом
            </button>

            <button
              onClick={() => handleAction({ type: 'RESET_STATS' })}
              className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
            >
              <Trash className="w-3 h-3 mr-1" />
              Сбросить статистику
            </button>

            {user.username === ADMIN_USERNAME && (
              <button
                onClick={handleResetAllUsers}
                disabled={isResetting}
                className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'Сброс...' : 'Сбросить всё'}
              </button>
            )}
          </div>

          {showPresets && (
            <div className="mt-2 space-y-2 bg-gray-50 p-2 rounded">
              {Object.entries(presetUserData).map(([username, data]) => (
                <button
                  key={username}
                  onClick={() => handlePresetSelect(username)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                >
                  <img 
                    src={data.photoUrl} 
                    alt={username} 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{data.firstName} {data.lastName}</span>
                  <span className="text-gray-500 text-xs">({username})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}