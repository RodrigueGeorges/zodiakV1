import { supabase } from './supabase';
import type { Profile, DailyGuidance } from './types/supabase';

export class StorageService {
  private static readonly PROFILE_PREFIX = 'profile_';
  private static readonly GUIDANCE_PREFIX = 'guidance_';
  private static readonly FORM_DATA_KEY = 'registration_form_data';
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly CACHE = new Map<string, any>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static getFromCache<T>(key: string): T | null {
    const cached = this.CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.CACHE.delete(key);
    return null;
  }

  private static setInCache<T>(key: string, data: T): void {
    this.CACHE.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // === PROFILES ===
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const cacheKey = `${this.PROFILE_PREFIX}${userId}`;
      const cached = this.getFromCache<Profile>(cacheKey);
      if (cached) {
        console.log('✅ Profil récupéré du cache');
        return cached;
      }

      console.log('🔄 Récupération du profil depuis Supabase...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      this.setInCache(cacheKey, data);
      console.log('💾 Profil mis en cache');
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  static async saveProfile(profile: Profile): Promise<boolean> {
    try {
      console.log('💾 Sauvegarde du profil dans Supabase...');
      const { error } = await supabase
        .from('profiles')
        .upsert(profile as Record<string, unknown>);

      if (error) throw error;

      const cacheKey = `${this.PROFILE_PREFIX}${profile.id}`;
      this.setInCache(cacheKey, profile);

      console.log('✅ Profil sauvegardé avec succès');
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  }

  // === DAILY GUIDANCE ===
  static async getDailyGuidance(userId: string, date: string): Promise<DailyGuidance | null> {
    try {
      const cacheKey = `${this.GUIDANCE_PREFIX}${userId}_${date}`;
      const cached = this.getFromCache<DailyGuidance>(cacheKey);
      if (cached) {
        console.log('✅ Guidance récupérée du cache');
        return cached;
      }

      console.log('🔄 Récupération de la guidance depuis Supabase...');
      const { data, error } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        console.log('⚠️ Aucune guidance trouvée pour cette date');
        return null;
      }

      this.setInCache(cacheKey, data);
      console.log('💾 Guidance mise en cache');
      return data;
    } catch (error) {
      console.error('Error getting guidance:', error);
      return null;
    }
  }

  static async saveDailyGuidance(guidance: DailyGuidance): Promise<boolean> {
    try {
      console.log('💾 Sauvegarde de la guidance dans Supabase...');
      const { error } = await supabase
        .from('daily_guidance')
        .upsert(guidance, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      const cacheKey = `${this.GUIDANCE_PREFIX}${guidance.user_id}_${guidance.date}`;
      this.setInCache(cacheKey, guidance);

      console.log('✅ Guidance sauvegardée avec succès');
      return true;
    } catch (error) {
      console.error('Error saving guidance:', error);
      return false;
    }
  }

  // === BATCH OPERATIONS ===
  static async getMultipleDailyGuidance(userId: string, dates: string[]): Promise<DailyGuidance[]> {
    try {
      console.log('🔄 Récupération de plusieurs guidances depuis Supabase...');
      const { data, error } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', userId)
        .in('date', dates);

      if (error) throw error;
      if (!data) return [];

      // Mettre en cache chaque guidance
      data.forEach(guidance => {
        const cacheKey = `${this.GUIDANCE_PREFIX}${userId}_${guidance.date}`;
        this.setInCache(cacheKey, guidance);
      });

      console.log(`✅ ${data.length} guidances récupérées et mises en cache`);
      return data;
    } catch (error) {
      console.error('Error getting multiple guidance:', error);
      return [];
    }
  }

  // === CACHE MANAGEMENT ===
  static clearCache(): void {
    this.CACHE.clear();
    console.log('🗑️ Cache vidé');
  }

  static clearUserCache(userId: string): void {
    // Supprimer les entrées de cache pour un utilisateur spécifique
    for (const [key] of this.CACHE) {
      if (key.includes(userId)) {
        this.CACHE.delete(key);
      }
    }
    console.log(`🗑️ Cache vidé pour l'utilisateur ${userId}`);
  }

  // === FORM DATA (localStorage only) ===
  static saveFormData(data: Record<string, unknown>): void {
    try {
      localStorage.setItem('formData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }

  static getFormData(): Record<string, unknown> | null {
    try {
      const data = localStorage.getItem(this.FORM_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Error getting form data:', error);
      return null;
    }
  }

  static clearFormData(): void {
    try {
      localStorage.removeItem(this.FORM_DATA_KEY);
    } catch (error) {
      console.warn('Error clearing form data:', error);
    }
  }

  // === UTILITY METHODS ===
  static async checkGuidanceExists(userId: string, date: string): Promise<boolean> {
    try {
      const cacheKey = `${this.GUIDANCE_PREFIX}${userId}_${date}`;
      const cached = this.getFromCache<DailyGuidance>(cacheKey);
      if (cached) return true;

      const { data, error } = await supabase
        .from('daily_guidance')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking guidance existence:', error);
      return false;
    }
  }

  static async getGuidanceHistory(userId: string, limit: number = 7): Promise<DailyGuidance[]> {
    try {
      console.log('🔄 Récupération de l\'historique des guidances...');
      const { data, error } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data) return [];

      // Mettre en cache chaque guidance
      data.forEach(guidance => {
        const cacheKey = `${this.GUIDANCE_PREFIX}${userId}_${guidance.date}`;
        this.setInCache(cacheKey, guidance);
      });

      console.log(`✅ ${data.length} guidances d'historique récupérées`);
      return data;
    } catch (error) {
      console.error('Error getting guidance history:', error);
      return [];
    }
  }

  static async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all profiles:', error);
      return [];
    }
  }
}