import { User, Sparkle, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Profil', icon: <User className="w-6 h-6" />, path: '/profile' },
  { label: 'Guidance', icon: <Sparkle className="w-6 h-6" />, path: '/guidance' },
  { label: 'Thème', icon: <Sun className="w-6 h-6" />, path: '/natal' },
];

export function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cosmic-900/95 backdrop-blur-lg border-t border-primary/20 shadow-2xl rounded-t-2xl flex justify-around items-center py-2 px-2 md:hidden">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 text-xs transition-all duration-200 font-cinzel ${
              isActive 
                ? 'text-primary' 
                : 'text-gray-300 hover:text-primary'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
} 