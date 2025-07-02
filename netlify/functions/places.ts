import type { Handler, HandlerEvent } from '@netlify/functions';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';

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

  // Timeout de 7 secondes
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Erreur Nominatim: ${response.status} ${response.statusText}`);
      return buildResponse(response.status, {
        error: 'Erreur lors de la communication avec le service de géolocalisation.',
      });
    }

    const data = await response.json();
    return buildResponse(200, data);
    
  } catch (err) {
    clearTimeout(timeout);
    const error = err as Error;
    if (error.name === 'AbortError') {
      console.error('Timeout lors de la requête Nominatim');
      return buildResponse(504, { error: 'Timeout lors de la requête Nominatim' });
    }
    console.error('Erreur interne du serveur:', error);
    return buildResponse(500, { error: `Erreur interne du serveur: ${error.message}` });
  }
};

export { handler }; 