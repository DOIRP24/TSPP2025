import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export function NavLink({ to, icon, label }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center py-2 px-3 ${
        isActive
          ? 'text-blue-600'
          : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}