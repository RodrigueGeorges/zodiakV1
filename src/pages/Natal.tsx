import { useAuth } from '../lib/hooks/useAuth.tsx';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import NatalChartTab from '../components/NatalChartTab';
import LoadingScreen from '../components/LoadingScreen';
import StarryBackground from '../components/StarryBackground';

export default function Natal() {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    if (!isLoading && isAuthenticated && !profile) {
      navigate('/profile', { replace: true });
    }
  }, [isLoading, isAuthenticated, profile, navigate]);

  if (isLoading) return <LoadingScreen message="Chargement de votre thème natal..." />;
  if (!profile) return <LoadingScreen error="Profil non trouvé. Redirection..." />;

  return (
    <div className="min-h-screen bg-cosmic-900 relative">
      <StarryBackground />
      <div className="container mx-auto px-4 md:px-8 xl:px-12 2xl:px-24 py-12">
        <div className="max-w-4xl xl:max-w-6xl 2xl:max-w-screen-xl mx-auto">
          <NatalChartTab profile={profile} />
        </div>
      </div>
    </div>
  );
} 