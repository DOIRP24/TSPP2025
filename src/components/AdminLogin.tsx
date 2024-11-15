import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const ADMIN_AUTH_KEY = 'admin_auth';
const ADMIN_USERNAME = 'admin';

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    const currentUser = localStorage.getItem('currentUser');
    const username = currentUser ? JSON.parse(currentUser).username : null;
    
    if (isAuth && username === ADMIN_USERNAME) {
      setIsAuthenticated(true);
      onLogin(true);
    }
  }, [onLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === ADMIN_USERNAME && credentials.password === 'admin') {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      onLogin(true);
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleResetAllUsers = async () => {
    if (!window.confirm('Вы уверены? Это действие удалит ВСЕ данные пользователей и не может быть отменено!')) {
      return;
    }

    setIsResetting(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      // Delete all users except admin
      const deletePromises = snapshot.docs
        .filter(doc => doc.data().username !== ADMIN_USERNAME)
        .map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
      
      // Clear local storage
      localStorage.clear();
      localStorage.setItem(ADMIN_AUTH_KEY, 'true'); // Keep admin logged in
      
      alert('Все данные пользователей успешно удалены');
    } catch (error) {
      console.error('Error resetting all users:', error);
      alert('Произошла ошибка при удалении данных');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Админ Панель</h1>
          <p className="text-gray-600 mt-2">Пожалуйста, войдите для продолжения</p>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Имя пользователя
              </label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите имя пользователя"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Войти
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">Вы вошли как администратор</p>
            </div>
            
            <button
              onClick={handleResetAllUsers}
              disabled={isResetting}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Удаление...' : 'Сбросить все данные пользователей'}</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Перейти к приложению
            </button>
          </div>
        )}
      </div>
    </div>
  );
}