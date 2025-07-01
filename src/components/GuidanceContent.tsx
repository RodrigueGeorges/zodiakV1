import { useState, useEffect } from 'react';
import { Heart, Briefcase, Battery } from 'lucide-react';
import { DateTime } from 'luxon';
import { toast } from 'react-hot-toast';
import { useAuth } from '../lib/hooks/useAuth';
import { useGuidance } from '../lib/hooks/useGuidance';
import LoadingScreen from './LoadingScreen';
import InteractiveCard from './InteractiveCard';
import FormattedGuidanceText from './FormattedGuidanceText';
import ShareModal from './ShareModal';
import { cn } from '../lib/utils';
import type { Json } from '../lib/types/supabase';
import type { JSX } from 'react';

const getGuidanceText = (field: Json): string => {
  if (typeof field === 'string') {
    return field;
  }
  if (typeof field === 'object' && field !== null && 'text' in field && typeof (field as { text: string }).text === 'string') {
    return (field as { text: string }).text;
  }
  return '';
};

const getGuidanceScore = (field: Json): number => {
  if (typeof field === 'object' && field !== null && 'score' in field && typeof (field as { score: number }).score === 'number') {
    return (field as { score: number }).score;
  }
  return 75; // Score par défaut
};

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

function GuidanceContent(): JSX.Element {
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  // Utiliser le nouveau hook optimisé
  const { guidance, loading, generateGuidance, refreshGuidance } = useGuidance();

  const today = DateTime.now().toISODate();

  useEffect(() => {
    if (!loading && !guidance && user?.id) {
      // Génère automatiquement la guidance du jour si elle n'existe pas
      generateGuidance();
    }
  }, [loading, guidance, user?.id, generateGuidance]);

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
            userName={user?.name || 'Utilisateur'}
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

export default GuidanceContent;