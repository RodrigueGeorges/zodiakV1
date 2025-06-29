import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Battery, Sparkle } from 'lucide-react';
import { cn } from '../lib/utils';
import { InteractiveCard } from './InteractiveCard';
import { ProfileTab } from './ProfileTab';
import { useGuidance } from '../lib/hooks/useGuidance';
import { LoadingScreen } from './LoadingScreen';
import Analytics from '../components/Analytics';
import type { Profile, Json } from '../lib/types/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../lib/hooks/useAuth.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormattedGuidanceText } from './FormattedGuidanceText';
import { DateTime } from 'luxon';
import { ShareModal } from './ShareModal';

const getGuidanceText = (field: Json): string => {
  if (typeof field === 'string') {
    return field;
  }
  if (typeof field === 'object' && field !== null && 'text' in field && typeof (field as any).text === 'string') {
    return (field as any).text;
  }
  return '';
};

const getGuidanceScore = (field: Json): number => {
  if (typeof field === 'object' && field !== null && 'score' in field && typeof (field as any).score === 'number') {
    return (field as any).score;
  }
  return 75; // Score par défaut
};

interface GuidanceContentProps {
  profile: Profile;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

// Icône Facebook SVG inline
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
  </svg>
);

// Mantras/citations inspirantes (peuvent être enrichis)
const MANTRAS = [
  "Chaque jour est une nouvelle aventure cosmique.",
  "Fais confiance à l'univers, il conspire en ta faveur.",
  "Ta lumière intérieure est ta meilleure boussole.",
  "Aujourd'hui, accueille le changement avec sérénité.",
  "L'énergie du jour t'invite à rayonner !"
];
function getRandomMantra() {
  return MANTRAS[Math.floor(Math.random() * MANTRAS.length)];
}

export function GuidanceContent({ profile }: GuidanceContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  // Utiliser le nouveau hook optimisé
  const { guidance, loading, error, generateGuidance, refreshGuidance } = useGuidance();

  const today = DateTime.now().toISODate();

  useEffect(() => {
    if (user?.id) {
      Analytics.trackPageView('guidance');
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading && !guidance && user?.id) {
      // Génère automatiquement la guidance du jour si elle n'existe pas
      generateGuidance();
    }
  }, [loading, guidance, user?.id, generateGuidance]);

  const handleGenerateGuidance = async () => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour générer une guidance');
      return;
    }

    try {
      await generateGuidance();
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    }
  };

  const handleRefreshGuidance = async () => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour actualiser la guidance');
      return;
    }

    try {
      await refreshGuidance();
      toast.success('Guidance actualisée !');
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '✨';
    return '💫';
  };

  if (loading) {
    return <LoadingScreen message="Chargement de votre guidance..." />;
  }

  // Affichage automatique de la guidance du jour si elle existe
  if (guidance) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-cinzel bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">Votre Guidance</h2>
            <span className="text-sm text-gray-300 bg-cosmic-800 px-2 py-1 rounded border border-white/10">
              {DateTime.fromISO(today).toFormat('dd/MM/yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshGuidance}
              className="px-3 py-1 text-gray-300 hover:text-primary transition-colors text-sm"
              title="Actualiser"
            >
              🔄 Actualiser
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black rounded-lg hover:opacity-90 transition-all duration-200 text-sm font-semibold shadow-lg"
            >
              Partager
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-400 text-right mb-2">
          Dernière guidance reçue le {DateTime.fromISO(today).toFormat('dd/MM/yyyy')} à 08:00
        </div>
        {/* Résumé général */}
        <InteractiveCard className="bg-gradient-to-br from-cosmic-800/80 to-cosmic-900/80 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✨</div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2 font-cinzel">Résumé du Jour</h3>
              <FormattedGuidanceText text={guidance.summary} />
            </div>
          </div>
        </InteractiveCard>
        {/* Conseils détaillés */}
        <div className="grid gap-4 md:grid-cols-3">
          <InteractiveCard className="bg-gradient-to-br from-pink-900/30 to-red-900/20 border-pink-500/20">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white font-cinzel">Amour</h3>
                  <span className={cn("text-sm font-medium", getScoreColor(getGuidanceScore(guidance.love)))}>
                    {getScoreEmoji(getGuidanceScore(guidance.love))} {getGuidanceScore(guidance.love)}%
                  </span>
                </div>
                <FormattedGuidanceText text={getGuidanceText(guidance.love)} />
              </div>
            </div>
          </InteractiveCard>
          <InteractiveCard className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-500/20">
            <div className="flex items-start gap-3">
              <Briefcase className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white font-cinzel">Travail</h3>
                  <span className={cn("text-sm font-medium", getScoreColor(getGuidanceScore(guidance.work)))}>
                    {getScoreEmoji(getGuidanceScore(guidance.work))} {getGuidanceScore(guidance.work)}%
                  </span>
                </div>
                <FormattedGuidanceText text={getGuidanceText(guidance.work)} />
              </div>
            </div>
          </InteractiveCard>
          <InteractiveCard className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/20">
            <div className="flex items-start gap-3">
              <Battery className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white font-cinzel">Énergie</h3>
                  <span className={cn("text-sm font-medium", getScoreColor(getGuidanceScore(guidance.energy)))}>
                    {getScoreEmoji(getGuidanceScore(guidance.energy))} {getGuidanceScore(guidance.energy)}%
                  </span>
                </div>
                <FormattedGuidanceText text={getGuidanceText(guidance.energy)} />
              </div>
            </div>
          </InteractiveCard>
        </div>
        {/* Mantra du jour */}
        <InteractiveCard className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <Sparkle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2 font-cinzel">Mantra du Jour</h3>
              <p className="text-gray-300 italic">"{getRandomMantra()}"</p>
            </div>
          </div>
        </InteractiveCard>
        {/* Modal de partage */}
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            guidance={getGuidanceText(guidance.summary)}
            userName={profile?.name || 'Utilisateur'}
          />
        )}
      </div>
    );
  }

  // Affichage si pas de guidance (première visite)
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl">✨</div>
        <h2 className="text-2xl font-bold font-cinzel bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">Bienvenue dans votre Guidance</h2>
        <p className="text-gray-300 max-w-md mx-auto">
          Votre guidance personnalisée est en cours de génération...
        </p>
      </div>
      <div className="flex justify-center">
        <LoadingScreen message="Génération de votre guidance..." />
      </div>
      <div className="text-center text-sm text-gray-400">
        La guidance est générée automatiquement dès que votre profil est complet.
      </div>
    </div>
  );
}