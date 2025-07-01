import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Compass, MessageSquare, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/hooks/useAuth';

function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { path: '/', icon: Star, label: 'Accueil' },
    { path: '/profile', icon: User, label: 'Profil' },
    { path: '/natal', icon: Compass, label: 'Natal' },
    { path: '/guidance', icon: MessageSquare, label: 'Guidance' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-lg border-t border-gray-700 safe-area-inset-bottom md:hidden">
      <div className="flex justify-around items-center px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200',
                'text-gray-400 hover:text-white',
                isActive && 'text-[#F5CBA7] bg-[#F5CBA7]/10'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavBar; 