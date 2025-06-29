import type { Handler, HandlerEvent } from '@netlify/functions';

// Fonction pour construire une réponse standardisée
const buildResponse = (statusCode: number, body: any, headers: Record<string, string> = {}) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: {
    'Access-Control-Allow-Origin': '*', // Permet les requêtes cross-origin
    'Content-Type': 'application/json',
    ...headers,
  },
});

const handler: Handler = async (event: HandlerEvent) => {
  const query = event.queryStringParameters?.q;

  if (!query) {
    return buildResponse(400, { error: 'Le paramètre "q" est manquant' });
  }

  // L'API Nominatim requiert un User-Agent spécifique pour l'identification.
  // Voir: https://operations.osmfoundation.org/policies/nominatim/
  const userAgent = `ZodiakApp/1.0 (dev; contact-info-not-available)`;

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      console.error(`Erreur Nominatim: ${response.status} ${response.statusText}`);
      return buildResponse(response.status, {
        error: 'Erreur lors de la communication avec le service de géolocalisation.',
      });
    }

    const data = await response.json();
    return buildResponse(200, data);
    
  } catch (err) {
    const error = err as Error;
    console.error('Erreur interne du serveur:', error);
    return buildResponse(500, { error: `Erreur interne du serveur: ${error.message}` });
  }
};

export { handler }; 