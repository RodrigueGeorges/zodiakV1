import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');
}

export function formatPlace(place: Place): string {
  const cityName = place.locale_names.fr?.[0] || place.city.fr?.[0] || place.locale_names.default?.[0];
  const admin = place.administrative[0];
  
  if (cityName && admin) {
    return `${cityName}, ${admin}`;
  }
  
  return cityName || place.display_name || 'Lieu inconnu';
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
  return data.map((item: any) => ({
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
    refetch,
    isStale,
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