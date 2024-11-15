import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { ProgramPage } from './pages/ProgramPage';
import { AdminLogin } from './components/AdminLogin';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TelegramUser } from './types';
import { isDesktop } from './utils/platform';

const ADMIN_USERNAME = 'admin';
const MAX_INIT_ATTEMPTS = 30;
const INIT_RETRY_DELAY = 100;

function App() {
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [isWebAppReady, setIsWebAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    if (isDesktop()) {
      setShowAdminLogin(true);
      return;
    }

    let timeoutId: number;
    let attempts = 0;

    const initTelegramWebApp = () => {
      try {
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          
          tg.ready();
          tg.expand();
          
          const initData = tg.initDataUnsafe;
          if (!initData?.user) {
            throw new Error('Не удалось получить данные пользователя');
          }

          const user = initData.user;
          user.is_admin = user.username === ADMIN_USERNAME;
          
          setCurrentUser(user);
          setIsWebAppReady(true);
          
          if (user.username === ADMIN_USERNAME) {
            setIsAdminAuthenticated(localStorage.getItem('isAdmin') === 'true');
          }
          
          return true;
        }
        return false;
      } catch (err) {
        console.error('Init error:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при инициализации');
        return false;
      }
    };

    const tryInit = () => {
      if (attempts >= MAX_INIT_ATTEMPTS) {
        setError('Не удалось инициализировать Telegram WebApp');
        return;
      }

      if (!initTelegramWebApp()) {
        attempts++;
        timeoutId = window.setTimeout(tryInit, INIT_RETRY_DELAY);
      }
    };

    tryInit();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (showAdminLogin && !isAdminAuthenticated) {
    return (
      <AdminLogin
        onLogin={(success) => {
          if (success) {
            setIsAdminAuthenticated(true);
            setShowAdminLogin(false);
            localStorage.setItem('isAdmin', 'true');
          }
        }}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Ошибка</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!isWebAppReady && !isDesktop()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><HomePage currentUser={currentUser} /></Layout>} />
          <Route path="/users" element={<Layout><UsersPage currentUser={currentUser} isAdmin={isAdminAuthenticated} /></Layout>} />
          <Route path="/program" element={<Layout><ProgramPage /></Layout>} />
          <Route path="/power-up" element={<Layout><div>Прокачка (в разработке)</div></Layout>} />
          <Route path="/tests" element={<Layout><div>Тесты (в разработке)</div></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;