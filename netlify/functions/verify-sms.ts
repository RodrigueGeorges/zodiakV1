import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { phone, code } = JSON.parse(event.body || '{}');

    if (!phone || !code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Pour l'instant, on simule une vérification simple
    // En production, vous devriez vérifier le code dans une base de données
    if (code === '123456') {
      // Code de test accepté
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true,
          message: 'Code vérifié avec succès'
        })
      };
    }

    // Code incorrect
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: 'Code incorrect'
      })
    };

  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Error verifying SMS code'
      })
    };
  }
}; 