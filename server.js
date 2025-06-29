import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { Vonage } from '@vonage/server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialiser Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Initialiser Vonage
const vonage = new Vonage({
  apiKey: process.env.VITE_VONAGE_API_KEY,
  apiSecret: process.env.VITE_VONAGE_API_SECRET
});

// Webhook pour les SMS entrants
app.post('/webhook/inbound-sms', async (req, res) => {
  try {
    console.log('SMS reçu:', req.body);

    const { msisdn, text, message_timestamp } = req.body;

    // Trouver l'utilisateur associé au numéro de téléphone
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', `+${msisdn}`)
      .single();

    if (profileError) {
      console.error('Erreur lors de la recherche du profil:', profileError);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Stocker le message dans Supabase
    const { error: insertError } = await supabase
      .from('inbound_messages')
      .insert({
        from: `+${msisdn}`,
        text,
        timestamp: new Date(parseInt(message_timestamp)).toISOString(),
        user_id: profiles.id,
        status: 'received'
      });

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement du message:', insertError);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
    }

    console.log('Message enregistré avec succès');
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Webhook pour les accusés de réception
app.post('/webhook/dlr', (req, res) => {
  console.log('DLR reçu:', req.body);
  res.status(200).json({ status: 'success' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});