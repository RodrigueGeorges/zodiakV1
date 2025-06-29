import { useState, useEffect, useCallback, useRef } from 'react';
import { StorageService } from '../storage';
import { useCache } from './useCache';
import type { Profile } from '../types/supabase';

interface UseProfileOptions {
  enableCache?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useProfile(userId: string | null, options: UseProfileOptions = {}) {
  const { enableCache = true, retryAttempts = 3, retryDelay = 1000 } = options;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const cache = useCache<Profile>({ ttl: 10 * 60 * 1000 }); // 10 minutes

  const loadProfile = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Vérifier le cache d'abord
    if (enableCache && !forceRefresh) {
      const cachedProfile = cache.get(`profile-${userId}`);
      if (cachedProfile) {
        setProfile(cachedProfile);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    const attemptLoad = async (attempt: number): Promise<void> => {
      try {
        const startTime = performance.now();
        const userProfile = await StorageService.getProfile(userId);
        const loadTime = performance.now() - startTime;
        
        // Mettre en cache
        if (enableCache && userProfile) {
          cache.set(`profile-${userId}`, userProfile);
        }
        
        setProfile(userProfile);
        retryCountRef.current = 0; // Reset retry count on success
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Requête annulée
        }

        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du profil';
        
        if (attempt < retryAttempts) {
          // Retry avec délai exponentiel
          const delay = retryDelay * Math.pow(2, attempt);
          retryCountRef.current = attempt + 1;
          
          setTimeout(() => {
            if (!abortControllerRef.current?.signal.aborted) {
              attemptLoad(attempt + 1);
            }
          }, delay);
          
          return;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    attemptLoad(0);
  }, [userId, enableCache, retryAttempts, retryDelay, cache]);

  useEffect(() => {
    loadProfile();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProfile]);

  // Fonction de rafraîchissement manuel
  const refreshProfile = useCallback(() => {
    loadProfile(true);
  }, [loadProfile]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    if (userId) {
      cache.invalidate(`profile-${userId}`);
    }
  }, [userId, cache]);

  return { 
    profile, 
    loading, 
    error, 
    refreshProfile, 
    invalidateCache,
    retryCount: retryCountRef.current 
  };
}