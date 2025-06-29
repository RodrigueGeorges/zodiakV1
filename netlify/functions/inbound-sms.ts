import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  console.log('Vonage webhook called:', {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body
  });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('SMS reçu:', body);

    const { msisdn, text, message_timestamp } = body;

    if (!msisdn || !text) {
      throw new Error('Données SMS manquantes');
    }

    // Trouver l'utilisateur associé au numéro de téléphone
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', `+${msisdn}`)
      .single();

    if (profileError) {
      console.error('Erreur lors de la recherche du profil:', profileError);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Utilisateur non trouvé' })
      };
    }

    // Stocker le message dans Supabase
    const { error: insertError } = await supabase
      .from('inbound_messages')
      .insert({
        from: `+${msisdn}`,
        text,
        timestamp: message_timestamp 
          ? new Date(parseInt(message_timestamp)).toISOString()
          : new Date().toISOString(),
        user_id: profiles.id,
        status: 'received',
        metadata: body
      });

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement du message:', insertError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erreur lors de l\'enregistrement' })
      };
    }

    console.log('Message enregistré avec succès');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'success' })
    };
  } catch (error) {
    console.error('Erreur webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur serveur'
      })
    };
  }
};