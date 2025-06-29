import { useRef, useCallback, useMemo } from 'react';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

interface UseCacheOptions {
  ttl: number; // Time to live in milliseconds
}

export function useCache<T>({ ttl }: UseCacheOptions) {
  const cache = useRef(new Map<string, CacheEntry<T>>());

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, value: T) => {
    const expiry = Date.now() + ttl;
    cache.current.set(key, { data: value, expiry });
  }, [ttl]);

  const clear = useCallback(() => {
    cache.current.clear();
  }, []);

  return useMemo(() => ({
    get,
    set,
    clear
  }), [get, set, clear]);
} 