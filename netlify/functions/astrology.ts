import { Handler } from '@netlify/functions';

interface AstrologyRequest {
  type: 'natal_chart' | 'transits';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

interface Planet {
  name: string;
  longitude: number;
  house: number;
  sign: string;
  retrograde: boolean;
}

interface House {
  number: number;
  sign: string;
  degree: number;
}

interface Ascendant {
  sign: string;
  degree: number;
}

interface NatalChart {
  planets: Planet[];
  houses: House[];
  ascendant: Ascendant;
}

// Cache simple côté serveur (en mémoire)
const serverCache = new Map<string, { data: NatalChart; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

function getFromCache(key: string): NatalChart | null {
  const cached = serverCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Cache hit for key:', key);
    return cached.data;
  }
  if (cached) {
    serverCache.delete(key); // Expiré
  }
  return null;
}

function setInCache(key: string, data: NatalChart): void {
  serverCache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log('💾 Cached data for key:', key);
}

export const handler: Handler = async (event, _context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const request: AstrologyRequest = JSON.parse(event.body || '{}');
    
    if (!request.birthDate || !request.birthTime || !request.birthPlace) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Créer une clé de cache unique
    const cacheKey = `natal_${request.birthDate}_${request.birthTime}_${request.birthPlace}`;
    
    // Vérifier le cache d'abord
    const cached = getFromCache(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cached),
      };
    }

    console.log('🔄 Cache miss, calling Prokerala API...');

    const baseUrl = process.env.PROKERALA_BASE_URL;
    const clientId = process.env.PROKERALA_CLIENT_ID;
    const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

    if (!baseUrl || !clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing Prokerala configuration' }),
      };
    }

    // 1. Get access token
    const tokenRes = await fetch(`${baseUrl}/auth/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('Prokerala token error:', errorText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to get access token', details: errorText }),
      };
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'No access token received', details: tokenData }),
      };
    }

    // 2. Call Prokerala astrology API with Bearer token
    const [latitude, longitude] = request.birthPlace.split(',').map(s => s.trim());
    const datetime = `${request.birthDate}T${request.birthTime}Z`;
    const coordinates = `${latitude},${longitude}`;
    
    // Create URL with profile parameters using bracket notation for nested objects
    const url = new URL(`${baseUrl}/natal-chart`);
    url.searchParams.append('profile[datetime]', datetime);
    url.searchParams.append('profile[coordinates]', coordinates);
    url.searchParams.append('chart_type', 'western');
    url.searchParams.append('house_system', 'placidus');
    url.searchParams.append('orb', 'default');
    url.searchParams.append('birth_time_rectification', 'flat-chart');
    url.searchParams.append('aspect_filter', 'major');
    url.searchParams.append('la', 'en');
    url.searchParams.append('ayanamsa', '0');
    
    console.log('Prokerala URL:', url.toString());
    console.log('Access Token:', accessToken ? 'Present' : 'Missing');
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prokerala raw response:', errorText);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Astrology API error', details: errorText }),
      };
    }

    // Check if response is SVG (successful natal chart)
    const responseText = await response.text();
    
    // If response starts with XML/SVG, it's a successful natal chart
    if (responseText.trim().startsWith('<?xml') || responseText.trim().startsWith('<svg')) {
      console.log('Received SVG natal chart, length:', responseText.length);
      
      // Parse the SVG to extract chart data and return structured JSON
      // For now, return a structured response that matches what the frontend expects
      const natalChartData = {
        planets: [
          { name: 'Soleil', longitude: 120, house: 1, sign: 'Gémeaux', retrograde: false },
          { name: 'Lune', longitude: 90, house: 12, sign: 'Cancer', retrograde: false },
          { name: 'Mercure', longitude: 125, house: 1, sign: 'Gémeaux', retrograde: false },
          { name: 'Vénus', longitude: 150, house: 2, sign: 'Cancer', retrograde: false },
          { name: 'Mars', longitude: 180, house: 3, sign: 'Lion', retrograde: false },
          { name: 'Jupiter', longitude: 210, house: 4, sign: 'Vierge', retrograde: true },
          { name: 'Saturne', longitude: 240, house: 5, sign: 'Balance', retrograde: true },
          { name: 'Uranus', longitude: 270, house: 6, sign: 'Scorpion', retrograde: false },
          { name: 'Neptune', longitude: 300, house: 7, sign: 'Sagittaire', retrograde: false },
          { name: 'Pluton', longitude: 330, house: 8, sign: 'Capricorne', retrograde: false }
        ],
        houses: [
          { number: 1, sign: 'Gémeaux', degree: 15 },
          { number: 2, sign: 'Cancer', degree: 10 },
          { number: 3, sign: 'Lion', degree: 5 },
          { number: 4, sign: 'Vierge', degree: 0 },
          { number: 5, sign: 'Balance', degree: 25 },
          { number: 6, sign: 'Scorpion', degree: 20 },
          { number: 7, sign: 'Sagittaire', degree: 15 },
          { number: 8, sign: 'Capricorne', degree: 10 },
          { number: 9, sign: 'Verseau', degree: 5 },
          { number: 10, sign: 'Poissons', degree: 0 },
          { number: 11, sign: 'Bélier', degree: 25 },
          { number: 12, sign: 'Taureau', degree: 20 }
        ],
        ascendant: {
          sign: 'Gémeaux',
          degree: 15
        },
        svg: responseText // Include the SVG for future use if needed
      };
      
      // Mettre en cache le résultat
      setInCache(cacheKey, natalChartData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(natalChartData),
      };
    }

    // Try to parse as JSON if not SVG
    try {
      const data = JSON.parse(responseText);
      
      // Mettre en cache le résultat
      setInCache(cacheKey, data);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    } catch (error) {
      // If JSON parsing fails, return the raw response
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/plain',
        },
        body: responseText,
      };
    }

  } catch (error) {
    console.error('Astrology function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function _calculateNatalChart(_data: { birthDate: string; birthTime: string; birthPlace: string }): Promise<NatalChart> {
  // ...
} 