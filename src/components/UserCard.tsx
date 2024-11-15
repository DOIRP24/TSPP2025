import React from 'react';
import { User, Crown, Shield, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { AdminPanel } from './AdminPanel';

interface UserCardProps {
  user: UserProfile;
  isCurrentUser?: boolean;
  currentUserIsAdmin?: boolean;
}

export function UserCard({ user, isCurrentUser, currentUserIsAdmin }: UserCardProps) {
  const formatUsername = (username: string) => {
    if (!username) return '';
    return username.startsWith('@') ? username : `@${username}`;
  };

  const getRoleBadge = () => {
    if (user.isAdmin) {
      return (
        <span className="ml-2">
          <Shield className="w-4 h-4 text-purple-500" />
        </span>
      );
    }
    if (user.role === 'organizer') {
      return (
        <span className="ml-2">
          <Shield className="w-4 h-4 text-blue-500" />
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transition-all duration-300 ${
      isCurrentUser ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
    }`}>
      <div className="relative">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.firstName}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        {isCurrentUser && (
          <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 animate-pulse">
            <Crown className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <h3 className="font-semibold text-lg">
            {user.firstName} {user.lastName}
          </h3>
          {getRoleBadge()}
          {user.streak > 1 && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              x{user.streak}
            </span>
          )}
        </div>
        {user.username && (
          <p className="text-gray-500">{formatUsername(user.username)}</p>
        )}
        <div className="flex items-center mt-2">
          <div className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
            {user.points} баллов
          </div>
        </div>

        {currentUserIsAdmin && <AdminPanel user={user} currentUserIsAdmin={currentUserIsAdmin} />}
      </div>
    </div>
  );
}