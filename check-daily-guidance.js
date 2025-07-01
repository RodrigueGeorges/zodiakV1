// Script de vérification automatique de la guidance quotidienne
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

async function checkDailyGuidance(userId) {
  console.log('🔍 Vérification automatique de la guidance quotidienne\n');

  // 1. Récupérer le profil utilisateur
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('❌ Erreur lors de la récupération du profil:', profileError.message);
    return;
  }
  if (!profile) {
    console.error('❌ Aucun profil trouvé pour l\'id:', userId);
    return;
  }

  console.log(`👤 Utilisateur: ${profile.name} (${profile.id})`);
  if ('email' in profile) console.log(`   📧 Email: ${profile.email}`);
  console.log(`   📱 Téléphone: ${profile.phone || '❌ Manquant'}`);
  console.log(`   🌌 Thème natal: ${profile.natal_chart ? '✅ Présent' : '❌ Manquant'}`);
  console.log(`   🔔 SMS activé: ${profile.daily_guidance_sms_enabled ? '✅ Oui' : '❌ Non'}`);
  console.log(`   ⏰ Heure de guidance: ${profile.guidance_sms_time || '08:00'}`);

  // 2. Vérifier la guidance du jour
  const today = new Date().toISOString().slice(0, 10);
  const { data: guidance, error: guidanceError } = await supabase
    .from('daily_guidance')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (guidanceError) {
    console.error('❌ Erreur lors de la vérification de la guidance:', guidanceError.message);
    return;
  }

  if (guidance) {
    console.log(`✅ Guidance trouvée pour aujourd'hui (${today}) !`);
    console.log(`   📝 Résumé: ${guidance.summary}`);
  } else {
    console.log(`⚠️  Aucune guidance trouvée pour aujourd'hui (${today})`);
  }
}

// Remplace par ton user_id
const USER_ID = '088c93ba-3925-4ddd-8bb1-cce49fe22a63';
checkDailyGuidance(USER_ID); 