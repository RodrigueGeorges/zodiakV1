import { DateTime } from 'luxon';

const API_URL = import.meta.env.VITE_ASTRO_API_URL;
const CLIENT_ID = import.meta.env.VITE_ASTRO_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_ASTRO_CLIENT_SECRET;

// Données de test pour le développement
const MOCK_DATA = {
  natalChart: {
    planets: [
      { name: 'Soleil', longitude: 120, house: 1, sign: 'Lion', retrograde: false },
      { name: 'Lune', longitude: 90, house: 2, sign: 'Cancer', retrograde: false },
      { name: 'Mercure', longitude: 125, house: 1, sign: 'Lion', retrograde: false },
      { name: 'Vénus', longitude: 150, house: 3, sign: 'Vierge', retrograde: false },
      { name: 'Mars', longitude: 180, house: 4, sign: 'Balance', retrograde: false },
      { name: 'Jupiter', longitude: 210, house: 5, sign: 'Scorpion', retrograde: true },
      { name: 'Saturne', longitude: 240, house: 6, sign: 'Sagittaire', retrograde: true }
    ],
    houses: [
      { number: 1, sign: 'Lion', degree: 15 },
      { number: 2, sign: 'Vierge', degree: 10 },
      { number: 3, sign: 'Balance', degree: 5 },
      { number: 4, sign: 'Scorpion', degree: 0 },
      { number: 5, sign: 'Sagittaire', degree: 25 },
      { number: 6, sign: 'Capricorne', degree: 20 },
      { number: 7, sign: 'Verseau', degree: 15 },
      { number: 8, sign: 'Poissons', degree: 10 },
      { number: 9, sign: 'Bélier', degree: 5 },
      { number: 10, sign: 'Taureau', degree: 0 },
      { number: 11, sign: 'Gémeaux', degree: 25 },
      { number: 12, sign: 'Cancer', degree: 20 }
    ],
    ascendant: {
      sign: 'Lion',
      degree: 15
    }
  },
  guidance: {
    summary: "Une journée propice à l'introspection et aux nouvelles initiatives. Les énergies astrales soutiennent vos projets personnels.",
    areas: {
      love: "Vénus forme un bel aspect avec votre Lune natale, favorisant l'harmonie dans vos relations. C'est le moment d'exprimer vos sentiments.",
      work: "Mercure en aspect favorable stimule votre créativité et votre communication. Vos idées seront particulièrement bien reçues aujourd'hui.",
      energy: "Mars vous donne l'énergie nécessaire pour accomplir vos objectifs. Restez focalisé sur vos priorités."
    }
  }
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UserData {
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
}

export class ApiService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static USE_MOCK = true; // Utiliser les données de test

  private static async fetchWithRetry<T>(
    endpoint: string,
    data: any,
    retries = 3
  ): Promise<ApiResponse<T>> {
    if (this.USE_MOCK) {
      console.log('Using mock data for', endpoint);
      return {
        success: true,
        data: endpoint === '/natal-chart' ? MOCK_DATA.natalChart : MOCK_DATA.guidance
      };
    }

    try {
      console.log(`API call to ${endpoint}`, { ...data, clientId: '***' });

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'API Error');
      }

      console.log(`API response from ${endpoint}:`, responseData);

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      console.error(`API error (${endpoint}):`, error);

      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithRetry(endpoint, data, retries - 1);
      }

      // Si toutes les tentatives échouent, utiliser les données de test
      console.log('Using mock data after all retries failed');
      return {
        success: true,
        data: endpoint === '/natal-chart' ? MOCK_DATA.natalChart : MOCK_DATA.guidance
      };
    }
  }

  private static getCacheKey(endpoint: string, data: any): string {
    return `${endpoint}:${JSON.stringify(data)}`;
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private static setInCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static async fetchNatalChart(userData: UserData) {
    const cacheKey = this.getCacheKey('/natal-chart', userData);
    const cached = this.getFromCache(cacheKey);
    if (cached) return { success: true, data: cached };

    const response = await this.fetchWithRetry('/natal-chart', {
      ...userData,
      timezone: 'Europe/Paris'
    });

    if (response.success && response.data) {
      this.setInCache(cacheKey, response.data);
    }

    return response;
  }

  static async fetchDailyGuidance(userId: string, natalData: any) {
    const today = DateTime.now().setZone('Europe/Paris').toISODate();
    const cacheKey = this.getCacheKey(`/guidance/${userId}`, { date: today });
    const cached = this.getFromCache(cacheKey);
    if (cached) return { success: true, data: cached };

    const response = await this.fetchWithRetry('/guidance', {
      natal_data: natalData,
      date: today,
      lang: 'fr'
    });

    if (response.success && response.data) {
      this.setInCache(cacheKey, response.data);
    }

    return response;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}