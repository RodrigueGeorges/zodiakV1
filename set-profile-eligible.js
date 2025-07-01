// Script pour rendre le profil de Rodrigue éligible à la génération automatique de guidance
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const USER_ID = '088c93ba-3925-4ddd-8bb1-cce49fe22a63';

async function setProfileEligible() {
  const { error } = await supabase
    .from('profiles')
    .update({
      daily_guidance_sms_enabled: true,
      subscription_status: 'active'
    })
    .eq('id', USER_ID);

  if (error) {
    console.error('❌ Erreur lors de la mise à jour du profil :', error.message);
  } else {
    console.log('✅ Profil mis à jour comme éligible à la génération automatique de guidance.');
  }
}

setProfileEligible(); 