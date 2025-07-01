import { useAuth } from '../lib/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Compass, MessageSquare, Star } from 'lucide-react';
import { cn } from '../lib/utils';

function TopNavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const navItems = [
    { label: 'Accueil', icon: <Star />, path: '/' },
    { label: 'Profil', icon: <User />, path: '/profile' },
    { label: 'Natal', icon: <Compass />, path: '/natal' },
    { label: 'Guidance', icon: <MessageSquare />, path: '/guidance' },
  ];

  return (
    <nav className="hidden md:flex w-full bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 px-8 py-2 z-40">
      <div className="flex gap-8 items-center mx-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-cinzel text-lg transition-colors',
              location.pathname === item.path
                ? 'bg-primary/20 text-primary'
                : 'text-gray-200 hover:bg-primary/10 hover:text-primary'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default TopNavBar; 