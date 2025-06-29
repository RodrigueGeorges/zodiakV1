import { supabase } from '../supabase';
import { StorageService } from '../storage';
import { Analytics } from '../monitoring/Analytics';
import type { Profile, DailyGuidance } from '../types/supabase';
import { DateTime } from 'luxon';

export class SupabaseOptimizationService {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  private static readonly BATCH_SIZE = 10; // Nombre d'éléments par batch

  /**
   * Récupère le profil utilisateur avec optimisation cache
   */
  static async getProfileOptimized(userId: string): Promise<Profile | null> {
    try {
      console.log('🔍 Recherche optimisée du profil...');
      
      // 1. Vérifier le cache local d'abord
      const cachedProfile = await StorageService.getProfile(userId);
      if (cachedProfile) {
        console.log('✅ Profil trouvé en cache local');
        return cachedProfile;
      }

      // 2. Récupérer depuis Supabase
      console.log('🔄 Récupération depuis Supabase...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // 3. Mettre en cache
      await StorageService.saveProfile(data);
      console.log('💾 Profil mis en cache');
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      Analytics.trackError(error instanceof Error ? error : new Error('Profile fetch failed'));
      return null;
    }
  }

  /**
   * Récupère la guidance quotidienne avec optimisation
   */
  static async getDailyGuidanceOptimized(userId: string, date: string): Promise<DailyGuidance | null> {
    try {
      console.log('🔍 Recherche optimisée de la guidance...');
      
      // 1. Vérifier le cache local d'abord
      const cachedGuidance = await StorageService.getDailyGuidance(userId, date);
      if (cachedGuidance) {
        console.log('✅ Guidance trouvée en cache local');
        return cachedGuidance;
      }

      // 2. Vérifier si la guidance existe dans Supabase
      const guidanceExists = await StorageService.checkGuidanceExists(userId, date);
      if (!guidanceExists) {
        console.log('⚠️ Aucune guidance trouvée pour cette date');
        return null;
      }

      // 3. Récupérer depuis Supabase
      console.log('🔄 Récupération depuis Supabase...');
      const { data, error } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // 4. Mettre en cache
      await StorageService.saveDailyGuidance(data);
      console.log('💾 Guidance mise en cache');
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la guidance:', error);
      Analytics.trackError(error instanceof Error ? error : new Error('Guidance fetch failed'));
      return null;
    }
  }

  /**
   * Récupère l'historique des guidances avec optimisation
   */
  static async getGuidanceHistoryOptimized(userId: string, limit: number = 7): Promise<DailyGuidance[]> {
    try {
      console.log('🔍 Récupération optimisée de l\'historique...');
      
      // 1. Calculer les dates à récupérer
      const dates = [];
      for (let i = 0; i < limit; i++) {
        const date = DateTime.now().minus({ days: i }).toISODate();
        dates.push(date);
      }

      // 2. Récupérer en batch depuis Supabase
      const { data, error } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', userId)
        .in('date', dates)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data) return [];

      // 3. Mettre en cache chaque guidance
      for (const guidance of data) {
        await StorageService.saveDailyGuidance(guidance);
      }

      console.log(`✅ ${data.length} guidances d'historique récupérées et mises en cache`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  /**
   * Sauvegarde optimisée avec vérification de doublons
   */
  static async saveGuidanceOptimized(guidance: DailyGuidance): Promise<boolean> {
    try {
      console.log('💾 Sauvegarde optimisée de la guidance...');
      
      // 1. Vérifier si la guidance existe déjà
      const exists = await StorageService.checkGuidanceExists(guidance.user_id, guidance.date);
      if (exists) {
        console.log('⚠️ Guidance déjà existante, mise à jour...');
      }

      // 2. Sauvegarder dans Supabase
      const { error } = await supabase
        .from('daily_guidance')
        .upsert(guidance, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      // 3. Mettre en cache
      await StorageService.saveDailyGuidance(guidance);
      console.log('✅ Guidance sauvegardée et mise en cache');

      Analytics.trackEvent('guidance', {
        action: 'save_optimized',
        userId: guidance.user_id,
        date: guidance.date
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde optimisée:', error);
      Analytics.trackError(error instanceof Error ? error : new Error('Guidance save failed'));
      return false;
    }
  }

  /**
   * Mise à jour optimisée du profil
   */
  static async updateProfileOptimized(profile: Profile): Promise<boolean> {
    try {
      console.log('💾 Mise à jour optimisée du profil...');
      
      // 1. Sauvegarder dans Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, {
          onConflict: 'id'
        });

      if (error) throw error;

      // 2. Mettre en cache
      await StorageService.saveProfile(profile);
      console.log('✅ Profil mis à jour et mis en cache');

      Analytics.trackEvent('profile', {
        action: 'update_optimized',
        userId: profile.id
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Analytics.trackError(error instanceof Error ? error : new Error('Profile update failed'));
      return false;
    }
  }

  /**
   * Préchargement intelligent des données
   */
  static async preloadUserData(userId: string): Promise<void> {
    try {
      console.log('🚀 Préchargement intelligent des données...');
      
      // 1. Précharger le profil
      await this.getProfileOptimized(userId);
      
      // 2. Précharger la guidance d'aujourd'hui
      const today = DateTime.now().toISODate();
      await this.getDailyGuidanceOptimized(userId, today);
      
      // 3. Précharger l'historique récent
      await this.getGuidanceHistoryOptimized(userId, 3);
      
      console.log('✅ Préchargement terminé');
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
    }
  }

  /**
   * Nettoyage du cache expiré
   */
  static async cleanupExpiredCache(): Promise<void> {
    try {
      console.log('🧹 Nettoyage du cache expiré...');
      
      // Vider le cache local
      StorageService.clearCache();
      
      console.log('✅ Cache nettoyé');
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  /**
   * Statistiques d'optimisation
   */
  static getOptimizationStats(): {
    cacheHits: number;
    cacheMisses: number;
    apiCalls: number;
  } {
    // Ces statistiques peuvent être étendues pour suivre les performances
    return {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0
    };
  }
} 