import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  console.log('Vonage DLR webhook called:', {
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
    console.log('DLR reçu:', body);

    // Stocker le DLR dans Supabase pour le suivi
    const { error: insertError } = await supabase
      .from('message_delivery_receipts')
      .insert({
        message_id: body.messageId,
        status: body.status,
        error_code: body.err_code,
        timestamp: new Date().toISOString(),
        metadata: body
      });

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement du DLR:', insertError);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'success' })
    };
  } catch (error) {
    console.error('Erreur DLR:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur serveur'
      })
    };
  }
};