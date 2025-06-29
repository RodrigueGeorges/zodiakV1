import { Logo } from './Logo/index';
import Tabs from './Tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  // Définir les onglets globaux
  const tabs = [
    { key: 'profile', label: 'Profil' },
    { key: 'natal', label: 'Thème Natal' },
    { key: 'guidance', label: 'Guidance' }
  ];
  // Déduire l'onglet actif selon la route
  let activeTab = 'profile';
  if (location.pathname.startsWith('/natal')) activeTab = 'natal';
  else if (location.pathname.startsWith('/guidance')) activeTab = 'guidance';
  else if (location.pathname.startsWith('/profile')) activeTab = 'profile';

  const handleTabChange = (key: string) => {
    if (key === 'profile') navigate('/profile');
    else if (key === 'natal') navigate('/natal');
    else if (key === 'guidance') navigate('/guidance');
  };

  return (
    <header className="w-full flex flex-col items-center justify-between px-4 md:px-8 py-0.5 md:py-2 h-12 md:h-auto bg-cosmic-900/80 backdrop-blur-lg border-b border-primary/20 shadow-lg z-50">
      <div className="w-full flex items-center gap-2 md:gap-4 cursor-pointer h-full" onClick={() => navigate('/guidance')}> 
        <div className="w-12 h-12 flex items-center justify-center md:hidden">
          <Logo size="sm" />
        </div>
        <div className="hidden md:flex w-32 h-32 items-center justify-center">
          <Logo size="md" />
        </div>
        <span className="hidden md:block text-2xl font-cinzel font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text tracking-widest">ZODIAK</span>
      </div>
      {/* Onglets de navigation (desktop uniquement) */}
      <div className="hidden md:block w-full mt-2">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </header>
  );
} 