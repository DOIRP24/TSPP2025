import React from 'react';
import { Home, Users, Calendar, Zap, BookOpen } from 'lucide-react';
import { NavLink } from './NavLink';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 pb-20">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between">
            <NavLink to="/" icon={<Home className="w-6 h-6" />} label="Главная" />
            <NavLink to="/program" icon={<Calendar className="w-6 h-6" />} label="Программа" />
            <NavLink to="/power-up" icon={<Zap className="w-6 h-6" />} label="Прокачка" />
            <NavLink to="/tests" icon={<BookOpen className="w-6 h-6" />} label="Тесты" />
            <NavLink to="/users" icon={<Users className="w-6 h-6" />} label="Участники" />
          </div>
        </div>
      </nav>
    </div>
  );
}