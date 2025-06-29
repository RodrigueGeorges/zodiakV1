import { Sun, Moon, Sparkle, Star, Heart, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Profile } from '../lib/types/supabase';
import { InteractiveCard } from './InteractiveCard';
import { OpenAIService } from '../lib/services/OpenAIService';
import { StorageService } from '../lib/storage';
import { CosmicLoader } from './CosmicLoader';
import { NatalSignature } from './NatalSignature';
import { toast } from 'react-hot-toast';

interface NatalChartTabProps {
  profile: Profile;
}

export function NatalChartTab({ profile }: NatalChartTabProps) {
  const [interpretation, setInterpretation] = useState<string | null>(profile.natal_chart_interpretation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [astroSummary, setAstroSummary] = useState<string | null>(profile.natal_summary || null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const natalChart = profile.natal_chart as any;
  const firstName = profile.name ? profile.name.split(' ')[0] : '';

  // Extraction des données principales
  const sunSign = natalChart?.planets?.find((p: any) => p.name === 'Soleil')?.sign || 'N/A';
  const moonSign = natalChart?.planets?.find((p: any) => p.name === 'Lune')?.sign || 'N/A';
  const ascendantSign = natalChart?.ascendant?.sign || 'N/A';
  const mercurySign = natalChart?.planets?.find((p: any) => p.name === 'Mercure')?.sign || 'N/A';
  const venusSign = natalChart?.planets?.find((p: any) => p.name === 'Vénus')?.sign || 'N/A';
  const marsSign = natalChart?.planets?.find((p: any) => p.name === 'Mars')?.sign || 'N/A';

  // On charge d'abord le résumé depuis Supabase si présent
  useEffect(() => {
    const generateSummary = async () => {
      if (!natalChart || astroSummary) return;
      setIsLoadingSummary(true);
      try {
        const summary = await OpenAIService.generateNatalSummary(natalChart, firstName);
        setAstroSummary(summary);
        // Sauvegarder le résumé dans Supabase pour éviter les futurs appels OpenAI
        const updatedProfile = { ...profile, natal_summary: summary };
        await StorageService.saveProfile(updatedProfile);
      } catch (err) {
        console.error('Erreur lors de la génération du résumé:', err);
        setAstroSummary(`${firstName}, votre signature astrale révèle un Soleil en ${sunSign}, une Lune en ${moonSign} et un Ascendant en ${ascendantSign}. Cette combinaison unique façonne votre personnalité et votre façon d'aborder la vie.`);
      } finally {
        setIsLoadingSummary(false);
      }
    };
    generateSummary();
  }, [natalChart, firstName, astroSummary, sunSign, moonSign, ascendantSign]);

  useEffect(() => {
    const generateInterpretation = async () => {
      // Ne pas générer si l'interprétation existe déjà
      if (!natalChart || interpretation) {
        setIsLoading(false);
        return;
      }

      // Vérifier si on a déjà tenté de générer aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `interpretation_attempt_${profile.id}_${today}`;
      const hasAttemptedToday = localStorage.getItem(cacheKey);
      
      if (hasAttemptedToday) {
        console.log('⚠️ Interprétation déjà tentée aujourd\'hui');
        setError('Interprétation non disponible. Réessayez demain.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Marquer qu'on a tenté aujourd'hui
        localStorage.setItem(cacheKey, 'true');
        
        console.log('🔄 Génération de l\'interprétation du thème natal...');
        const generatedText = await OpenAIService.generateNatalChartInterpretation(natalChart);
        setInterpretation(generatedText);
        
        const updatedProfile = { ...profile, natal_chart_interpretation: generatedText };
        await StorageService.saveProfile(updatedProfile);
        console.log('✅ Interprétation générée et sauvegardée');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la génération de votre interprétation.');
        console.error('❌ Erreur lors de la génération de l\'interprétation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generateInterpretation();
  }, [natalChart, interpretation, profile]);

  if (!natalChart) {
    return (
      <InteractiveCard className="p-8 text-center bg-gradient-to-br from-cosmic-800/80 to-cosmic-900/80 rounded-2xl shadow-lg border border-primary/20">
        <div className="text-6xl mb-4">🌌</div>
        <h3 className="text-xl font-cinzel font-bold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">Thème Natal non disponible</h3>
        <p className="text-gray-400 mb-6">
          Veuillez compléter vos informations de naissance dans votre profil pour calculer votre thème natal.
        </p>
        <button 
          onClick={() => window.location.href = '/profile'}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-black font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg"
        >
          Compléter mon profil
        </button>
      </InteractiveCard>
    );
  }

  // Générer dynamiquement toutes les planètes principales
  const planetIconMap: { [key: string]: JSX.Element } = {
    Soleil: <Sun className="w-8 h-8" />,
    Lune: <Moon className="w-8 h-8" />,
    Mercure: <MessageSquare className="w-8 h-8" />,
    Vénus: <Heart className="w-8 h-8" />,
    Mars: <MessageSquare className="w-8 h-8" />,
    Jupiter: <Star className="w-8 h-8" />,
    Saturne: <Star className="w-8 h-8" />,
    Uranus: <Star className="w-8 h-8" />,
    Neptune: <Star className="w-8 h-8" />,
    Pluton: <Star className="w-8 h-8" />,
    Ascendant: <Sparkle className="w-8 h-8" />
  };
  const planetColorMap: { [key: string]: string } = {
    Soleil: 'text-yellow-400',
    Lune: 'text-slate-300',
    Mercure: 'text-green-400',
    Vénus: 'text-pink-400',
    Mars: 'text-red-400',
    Jupiter: 'text-orange-400',
    Saturne: 'text-indigo-400',
    Uranus: 'text-cyan-400',
    Neptune: 'text-blue-400',
    Pluton: 'text-purple-400',
    Ascendant: 'text-fuchsia-400'
  };
  const planetBgMap: { [key: string]: string } = {
    Soleil: 'from-yellow-900/30 to-yellow-900/10',
    Lune: 'from-slate-800/40 to-slate-900/10',
    Mercure: 'from-green-900/30 to-green-900/10',
    Vénus: 'from-pink-900/30 to-pink-900/10',
    Mars: 'from-red-900/30 to-red-900/10',
    Jupiter: 'from-orange-900/30 to-orange-900/10',
    Saturne: 'from-indigo-900/30 to-indigo-900/10',
    Uranus: 'from-cyan-900/30 to-cyan-900/10',
    Neptune: 'from-blue-900/30 to-blue-900/10',
    Pluton: 'from-purple-900/30 to-purple-900/10',
    Ascendant: 'from-fuchsia-900/30 to-fuchsia-900/10'
  };
  const planetBorderMap: { [key: string]: string } = {
    Soleil: 'border-yellow-400/20',
    Lune: 'border-slate-300/10',
    Mercure: 'border-green-400/20',
    Vénus: 'border-pink-400/20',
    Mars: 'border-red-400/20',
    Jupiter: 'border-orange-400/20',
    Saturne: 'border-indigo-400/20',
    Uranus: 'border-cyan-400/20',
    Neptune: 'border-blue-400/20',
    Pluton: 'border-purple-400/20',
    Ascendant: 'border-fuchsia-400/20'
  };
  const planetDescriptionMap: { [key: string]: string } = {
    Soleil: 'Votre identité et votre volonté',
    Lune: 'Vos émotions et votre intuition',
    Mercure: 'Votre communication et pensée',
    Vénus: 'Vos valeurs et relations',
    Mars: 'Votre énergie et actions',
    Jupiter: 'Votre expansion et chance',
    Saturne: 'Votre structure et discipline',
    Uranus: 'Votre originalité et innovation',
    Neptune: 'Votre spiritualité et rêves',
    Pluton: 'Votre transformation et pouvoir',
    Ascendant: 'Votre apparence et première impression'
  };
  // Générer la liste des planètes à afficher
  let allPlanets: { name: string; sign: string }[] = natalChart?.planets ? [...natalChart.planets] : [];
  if (natalChart?.ascendant?.sign) {
    allPlanets.unshift({ name: 'Ascendant', sign: natalChart.ascendant.sign });
  }

  return (
    <div className="space-y-6 pt-2 md:pt-6 min-h-[60vh] flex flex-col justify-start mt-2">
      {/* En-tête avec signature astrale */}
      <div className="text-center mb-0 mt-0">
        <h2 className="text-2xl md:text-3xl font-cinzel font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Votre Thème Natal
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg">
          Découvrez votre carte du ciel de naissance, {firstName}. Chaque planète révèle une facette unique de votre personnalité.
        </p>
        <div className="mt-2 mb-2 text-primary font-cinzel text-base md:text-lg">
          {isLoadingSummary ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Génération de votre résumé astrologique...</span>
            </div>
          ) : astroSummary ? (
            <div className="animate-pulse bg-cosmic-900/70 rounded-xl p-4 mx-auto max-w-xl text-base sm:text-lg md:text-xl leading-relaxed text-primary shadow-lg">
              {astroSummary}
            </div>
          ) : (
            <div className="text-gray-400">
              Chargement de votre signature astrale...
            </div>
          )}
        </div>
      </div>

      {/* Signature astrale simplifiée */}
      <NatalSignature sunSign={sunSign} moonSign={moonSign} ascendantSign={ascendantSign} />

      {/* Grille adaptative des planètes */}
      <div className={`grid gap-4 justify-center px-2 sm:px-4 flex-1 grid-cols-1 sm:grid-cols-2 ${
        allPlanets.length <= 2 ? '' : allPlanets.length <= 4 ? '' : 'md:grid-cols-3'
      }`}>
        {allPlanets.map((planet, index) => (
          <InteractiveCard
            key={planet.name}
            tabIndex={0}
            aria-label={`Planète ${planet.name}, signe ${planet.sign}`}
            className={`p-6 text-center bg-gradient-to-br ${planetBgMap[planet.name as string] || 'from-cosmic-800/40 to-cosmic-900/10'} rounded-2xl border ${planetBorderMap[planet.name as string] || 'border-white/10'} shadow-lg transition-transform duration-200 focus:ring-2 focus:ring-primary/50 outline-none hover:scale-105 hover:shadow-[0_0_24px_4px_rgba(245,203,167,0.25)] active:scale-100`}
          >
            <div className={`mx-auto mb-3 ${planetColorMap[planet.name as string] || 'text-white'}`}>
              {planetIconMap[planet.name as string] || <Star className="w-8 h-8" />}
            </div>
            <h4 className="text-lg font-semibold font-cinzel text-white mb-1">{planet.name}</h4>
            <p className="text-2xl font-cinzel font-bold text-white mb-2">{planet.sign}</p>
            <p className="text-sm text-gray-300">{planetDescriptionMap[planet.name as string] || ''}</p>
          </InteractiveCard>
        ))}
      </div>

      {/* Section interprétation */}
      <InteractiveCard className="p-6 bg-gradient-to-br from-cosmic-800/80 to-cosmic-900/80 rounded-2xl shadow-lg border border-primary/20">
        <div className="text-center mb-6">
          <h3 className="text-xl font-cinzel font-bold mb-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Interprétation Personnalisée
          </h3>
          <p className="text-gray-300">
            Une analyse approfondie de votre thème natal générée par IA
          </p>
        </div>

        {!showInterpretation && !isLoading && interpretation && (
          <div className="text-center">
            <button
              onClick={() => setShowInterpretation(true)}
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-black font-semibold rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg"
            >
              <Star className="w-5 h-5" />
              Lire mon interprétation
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <CosmicLoader />
            <p className="mt-4 text-lg text-gray-300 animate-pulse">
              Génération de votre interprétation astrologique...
            </p>
            <p className="text-sm text-gray-500 mt-2">Cela peut prendre une minute.</p>
          </div>
        )}

        {error && (
          <div className="text-center p-4">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
            >
              Réessayer
            </button>
          </div>
        )}

        {showInterpretation && interpretation && (
          <div className="space-y-4">
            <div 
              className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {interpretation}
            </div>
            <div className="flex justify-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(interpretation);
                  toast.success('Interprétation copiée !');
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Copier
              </button>
              <button
                onClick={() => setShowInterpretation(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Masquer
              </button>
            </div>
          </div>
        )}
      </InteractiveCard>
    </div>
  );
}