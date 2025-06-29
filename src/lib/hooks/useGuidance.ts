import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { StorageService } from '../storage';
import { AstrologyService } from '../astrology';
import { OpenAIService } from '../services/OpenAIService';
import { DateTime } from 'luxon';
import { toast } from 'react-hot-toast';
import type { DailyGuidance } from '../types/supabase';

interface GuidanceData {
  summary: string;
  love: { text: string; score: number };
  work: { text: string; score: number };
  energy: { text: string; score: number };
}

interface UseGuidanceReturn {
  guidance: GuidanceData | null;
  loading: boolean;
  error: string | null;
  generateGuidance: () => Promise<void>;
  refreshGuidance: () => Promise<void>;
}

export function useGuidance(): UseGuidanceReturn {
  const { user, profile } = useAuth();
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptDate, setLastAttemptDate] = useState<string | null>(null);

  const today = DateTime.now().toISODate();

  // Vérifier si on a déjà tenté de générer une guidance aujourd'hui
  const hasAttemptedToday = lastAttemptDate === today;

  const loadGuidanceFromStorage = useCallback(async () => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Recherche de guidance existante dans Supabase...');
      const storedGuidance = await StorageService.getDailyGuidance(user.id, today);
      
      if (storedGuidance) {
        console.log('✅ Guidance trouvée dans Supabase');
        return {
          summary: storedGuidance.summary,
          love: typeof storedGuidance.love === 'string' 
            ? { text: storedGuidance.love, score: 75 } 
            : storedGuidance.love as { text: string; score: number },
          work: typeof storedGuidance.work === 'string' 
            ? { text: storedGuidance.work, score: 75 } 
            : storedGuidance.work as { text: string; score: number },
          energy: typeof storedGuidance.energy === 'string' 
            ? { text: storedGuidance.energy, score: 75 } 
            : storedGuidance.energy as { text: string; score: number }
        };
      }
      
      console.log('⚠️ Aucune guidance trouvée dans Supabase');
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la guidance:', error);
      return null;
    }
  }, [user?.id, today]);

  const generateGuidance = useCallback(async () => {
    if (!user?.id || !profile) {
      setError('Utilisateur non connecté ou profil incomplet');
      return;
    }

    // Vérifier si on a déjà tenté aujourd'hui
    if (hasAttemptedToday) {
      console.log('⚠️ Guidance déjà tentée aujourd\'hui, pas de nouvelle tentative');
      toast.error('Une guidance a déjà été générée aujourd\'hui. Réessayez demain.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Génération d\'une nouvelle guidance...');
      
      // Vérifier d'abord si on a un thème natal
      if (!profile.natal_chart || typeof profile.natal_chart === 'string') {
        throw new Error('Thème natal non disponible. Veuillez compléter votre profil.');
      }

      // Calculer les transits du jour (avec cache)
      const transits = await AstrologyService.calculateDailyTransits(today);
      
      // Générer la guidance avec OpenAI
      const guidanceData = await OpenAIService.generateGuidance(
        profile.natal_chart as any,
        transits
      );

      // Sauvegarder dans Supabase
      const guidanceToSave: DailyGuidance = {
        id: crypto.randomUUID(),
        user_id: user.id,
        date: today,
        summary: guidanceData.summary,
        love: guidanceData.love,
        work: guidanceData.work,
        energy: guidanceData.energy,
        created_at: new Date().toISOString()
      };

      const saved = await StorageService.saveDailyGuidance(guidanceToSave);
      
      if (saved) {
        setGuidance(guidanceData);
        setLastAttemptDate(today);
        console.log('✅ Guidance générée et sauvegardée avec succès');
        toast.success('Guidance générée avec succès !');
      } else {
        throw new Error('Erreur lors de la sauvegarde de la guidance');
      }

    } catch (error) {
      console.error('Erreur lors de la génération de la guidance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile, today, hasAttemptedToday]);

  const refreshGuidance = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Actualisation de la guidance...');
      
      // Vider le cache pour forcer le rechargement depuis Supabase
      StorageService.clearUserCache(user.id);
      
      const storedGuidance = await loadGuidanceFromStorage();
      
      if (storedGuidance) {
        setGuidance(storedGuidance);
        console.log('✅ Guidance actualisée');
      } else {
        setGuidance(null);
        console.log('⚠️ Aucune guidance trouvée après actualisation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
      setError('Erreur lors de l\'actualisation');
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadGuidanceFromStorage]);

  // Charger la guidance au montage du composant
  useEffect(() => {
    const loadGuidance = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const storedGuidance = await loadGuidanceFromStorage();
        
        if (storedGuidance) {
          setGuidance(storedGuidance);
          console.log('✅ Guidance chargée depuis Supabase');
        } else {
          console.log('⚠️ Aucune guidance disponible pour aujourd\'hui');
          setGuidance(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
        setError('Erreur lors du chargement de la guidance');
      } finally {
        setLoading(false);
      }
    };

    loadGuidance();
  }, [user?.id, loadGuidanceFromStorage]);

  // Charger la date de dernière tentative depuis localStorage
  useEffect(() => {
    const savedAttemptDate = localStorage.getItem(`guidance_attempt_${user?.id}_${today}`);
    if (savedAttemptDate) {
      setLastAttemptDate(savedAttemptDate);
    }
  }, [user?.id, today]);

  // Sauvegarder la date de tentative
  useEffect(() => {
    if (lastAttemptDate && user?.id) {
      localStorage.setItem(`guidance_attempt_${user.id}_${today}`, lastAttemptDate);
    }
  }, [lastAttemptDate, user?.id, today]);

  return {
    guidance,
    loading,
    error,
    generateGuidance,
    refreshGuidance
  };
}