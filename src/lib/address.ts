// Service pour la gestion des adresses
// Utilise l'API adresse.data.gouv.fr pour la recherche et la géocodification

interface AddressFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    label: string;
    score: number;
    housenumber?: string;
    street?: string;
    postcode: string;
    city: string;
    context: string;
    type: string;
    id: string;
    citycode: string;
    x: number;
    y: number;
  };
}

interface AddressResponse {
  type: string;
  version: string;
  features: AddressFeature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
}

export interface Address {
  id: string;
  label: string;
  street?: string;
  postcode: string;
  city: string;
  context: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
}

export class AddressService {
  private static readonly API_URL = 'https://api-adresse.data.gouv.fr';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  private static cache = new Map<string, { data: Address[]; timestamp: number }>();

  private static getFromCache(query: string): Address[] | null {
    const cached = this.cache.get(query);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(query);
    return null;
  }

  private static setInCache(query: string, data: Address[]): void {
    this.cache.set(query, {
      data,
      timestamp: Date.now()
    });
  }

  static async search(query: string, options: {
    limit?: number;
    type?: 'housenumber' | 'street' | 'locality' | 'municipality';
    postcode?: string;
    citycode?: string;
  } = {}): Promise<Address[]> {
    try {
      if (!query.trim()) return [];

      // Vérifier le cache
      const cacheKey = `${query}:${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Construire l'URL avec les paramètres
      const params = new URLSearchParams({
        q: query,
        limit: String(options.limit || 5),
        ...options.type ? { type: options.type } : {},
        ...options.postcode ? { postcode: options.postcode } : {},
        ...options.citycode ? { citycode: options.citycode } : {}
      });

      console.log('Fetching addresses:', `${this.API_URL}/search/?${params}`);

      const response = await fetch(`${this.API_URL}/search/?${params}`);
      
      if (!response.ok) {
        console.error('Address API error:', response.status, response.statusText);
        throw new Error('Erreur lors de la recherche d\'adresse');
      }

      const data: AddressResponse = await response.json();
      console.log('Address API response:', data);

      // Transformer les résultats
      const addresses = data.features.map(feature => ({
        id: feature.properties.id,
        label: feature.properties.label,
        street: feature.properties.street,
        postcode: feature.properties.postcode,
        city: feature.properties.city,
        context: feature.properties.context,
        coordinates: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        },
        type: feature.properties.type
      }));

      // Mettre en cache
      this.setInCache(cacheKey, addresses);

      return addresses;
    } catch (error) {
      console.error('Erreur de recherche d\'adresse:', error);
      return [];
    }
  }

  static async reverse(lat: number, lng: number): Promise<Address | null> {
    try {
      const response = await fetch(
        `${this.API_URL}/reverse/?lat=${lat}&lon=${lng}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la géocodage inverse');
      }

      const data: AddressResponse = await response.json();

      if (data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      return {
        id: feature.properties.id,
        label: feature.properties.label,
        street: feature.properties.street,
        postcode: feature.properties.postcode,
        city: feature.properties.city,
        context: feature.properties.context,
        coordinates: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        },
        type: feature.properties.type
      };
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      return null;
    }
  }

  static formatAddress(address: Address): string {
    if (!address) return '';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.postcode || address.city) {
      parts.push(`${address.postcode} ${address.city}`.trim());
    }
    return parts.join(', ');
  }

  static clearCache(): void {
    this.cache.clear();
  }
}