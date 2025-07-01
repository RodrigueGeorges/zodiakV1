import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './hooks/useDebounce';

export interface Place {
  objectID: string;
  locale_names: { [key: string]: string[] };
  city: { [key:string]: string[] };
  administrative: string[];
  country: string;
  country_code: string;
  postcode: string[];
  population: number;
  _geoloc: {
    lat: number;
    lng: number;
  };
  importance: number;
  display_name?: string;
  lat?: string;
  lon?: string;
}

export function formatPlace(place: Place): string {
  const cityName = place.locale_names.fr?.[0] || place.city.fr?.[0] || place.locale_names.default?.[0];
  const admin = place.administrative[0];
  
  if (cityName && admin) {
    return `${cityName}, ${admin}`;
  }
  
  return cityName || place.display_name || 'Lieu inconnu';
}

interface NominatimPlace {
  place_id: number;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country: string;
    country_code: string;
    postcode?: string;
  };
  name: string;
  population?: number;
  lat: string;
  lon: string;
  importance: number;
  display_name: string;
}

const fetchPlaces = async (query: string): Promise<Place[]> => {
  if (query.length < 2) {
    return [];
  }

  const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('La recherche de lieux a échoué');
  }
  const data = await response.json();
  
  if (!Array.isArray(data)) {
    return [];
  }

  // Map Nominatim response to our Place interface
  return data.map((item: NominatimPlace) => ({
    objectID: item.place_id.toString(),
    place_id: item.place_id,
    locale_names: { fr: [item.address.city || item.address.town || item.address.village || item.name] },
    city: { fr: [item.address.city || item.address.town || item.address.village || item.name] },
    administrative: [item.address.state || ''],
    country: item.address.country,
    country_code: item.address.country_code,
    postcode: [item.address.postcode || ''],
    population: item.population || 0,
    _geoloc: {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    },
    importance: item.importance,
    display_name: item.display_name,
    lat: item.lat,
    lon: item.lon,
  }));
};

export function usePlaceSearch(query: string, delay = 300) {
  const debouncedQuery = useDebounce(query, delay);

  const { 
    data: places = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['places', debouncedQuery],
    queryFn: () => fetchPlaces(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  
  return { 
    places, 
    loading, 
    error: error ? (error instanceof Error ? error.message : String(error)) : null 
  };
}

export async function getCoordsFromPlaceString(placeString: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(`/api/places?q=${encodeURIComponent(placeString)}&limit=1`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
        return null;
    }
    
    const place = data[0];
    if (!place.lat || !place.lon) return null;

    return {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des coordonnées:', error);
    return null;
  }
}

export function validatePlace(place: Place | null): boolean {
  return place !== null && !!place.lat && !!place.lon;
} 