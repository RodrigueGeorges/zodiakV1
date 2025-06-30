import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { cn } from '../lib/utils';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { key: 'profile', label: 'Profil', path: '/profile' },
    { key: 'natal', label: 'Thème Natal', path: '/natal' },
    { key: 'guidance', label: 'Guidance', path: '/guidance' }
  ];

  const getActiveTab = () => {
    if (location.pathname.startsWith('/natal')) return 'natal';
    if (location.pathname.startsWith('/guidance')) return 'guidance';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'profile';
  };

  const handleTabChange = (key: string) => {
    const tab = tabs.find(t => t.key === key);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Logo className="w-8 h-8" />
          <h1 className="text-lg font-semibold text-white">Zodiak</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = getActiveTab() === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'text-gray-300 hover:text-white',
                  isActive && 'text-[#F5CBA7] bg-[#F5CBA7]/10'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Header; 