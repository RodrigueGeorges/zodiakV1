// Script de monitoring de la génération automatique des guidances
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

async function checkGuidances() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`🔍 Vérification des guidances pour la date : ${today}\n`);

  // 1. Récupérer tous les profils éligibles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, daily_guidance_sms_enabled, subscription_status')
    .eq('daily_guidance_sms_enabled', true)
    .in('subscription_status', ['active', 'trial']);

  if (profilesError) {
    console.error('❌ Erreur lors de la récupération des profils :', profilesError.message);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('Aucun utilisateur éligible trouvé.');
    return;
  }

  let allOk = true;
  for (const profile of profiles) {
    const { data: guidance, error: guidanceError } = await supabase
      .from('daily_guidance')
      .select('id')
      .eq('user_id', profile.id)
      .eq('date', today)
      .maybeSingle();

    if (guidanceError) {
      console.error(`❌ Erreur pour ${profile.name} (${profile.id}) :`, guidanceError.message);
      allOk = false;
    } else if (guidance) {
      console.log(`✅ Guidance trouvée pour ${profile.name} (${profile.id})`);
    } else {
      console.log(`❌ Guidance manquante pour ${profile.name} (${profile.id})`);
      allOk = false;
    }
  }

  if (allOk) {
    console.log('\n🎉 Toutes les guidances du jour sont générées pour les utilisateurs éligibles !');
  } else {
    console.log('\n⚠️  Certaines guidances sont manquantes. Vérifiez la fonction planifiée ou les logs.');
  }
}

checkGuidances(); 