import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRodrigueGuidance() {
  console.log('🔍 Vérification de la guidance de Rodrigue Etifier...\n');

  try {
    // 1. Rechercher le profil de Rodrigue
    console.log('1️⃣ Recherche du profil de Rodrigue...');
    const { data: rodrigueProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('name', '%Rodrigue%')
      .maybeSingle();

    if (profileError) {
      console.error('❌ Erreur lors de la recherche:', profileError.message);
      return;
    }

    if (!rodrigueProfile) {
      console.log('❌ Aucun utilisateur nommé "Rodrigue" trouvé');
      
      // Lister tous les utilisateurs pour aider
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('name, id')
        .limit(5);
      
      if (allProfiles) {
        console.log('\n📋 Utilisateurs disponibles:');
        allProfiles.forEach(p => console.log(`   - ${p.name} (${p.id})`));
      }
      return;
    }

    console.log(`✅ Profil trouvé: ${rodrigueProfile.name}`);
    console.log(`   📱 Téléphone: ${rodrigueProfile.phone || '❌ Manquant'}`);
    console.log(`   📊 Statut: ${rodrigueProfile.subscription_status}`);
    console.log(`   🔔 SMS activé: ${rodrigueProfile.daily_guidance_sms_enabled ? '✅ Oui' : '❌ Non'}`);
    console.log(`   ⏰ Heure de guidance: ${rodrigueProfile.guidance_sms_time || '08:00'}`);
    console.log(`   📅 Dernière guidance envoyée: ${rodrigueProfile.last_guidance_sent || 'Jamais'}`);

    // 2. Vérifier la guidance d'aujourd'hui
    console.log('\n2️⃣ Vérification de la guidance d\'aujourd\'hui...');
    const today = new Date().toISOString().slice(0, 10);
    
    const { data: todayGuidance, error: guidanceError } = await supabase
      .from('daily_guidance')
      .select('*')
      .eq('user_id', rodrigueProfile.id)
      .eq('date', today)
      .maybeSingle();

    if (guidanceError) {
      console.error('❌ Erreur lors de la vérification de la guidance:', guidanceError.message);
      return;
    }

    if (todayGuidance) {
      console.log('✅ Rodrigue a reçu sa guidance aujourd\'hui !');
      console.log(`   📝 Résumé: ${todayGuidance.summary}`);
      
      // Afficher les détails selon le format
      if (typeof todayGuidance.love === 'string') {
        console.log(`   💖 Amour: ${todayGuidance.love}`);
      } else if (todayGuidance.love?.text) {
        console.log(`   💖 Amour: ${todayGuidance.love.text}`);
      }
      
      if (typeof todayGuidance.work === 'string') {
        console.log(`   💼 Travail: ${todayGuidance.work}`);
      } else if (todayGuidance.work?.text) {
        console.log(`   💼 Travail: ${todayGuidance.work.text}`);
      }
      
      if (typeof todayGuidance.energy === 'string') {
        console.log(`   ⚡ Énergie: ${todayGuidance.energy}`);
      } else if (todayGuidance.energy?.text) {
        console.log(`   ⚡ Énergie: ${todayGuidance.energy.text}`);
      }
    } else {
      console.log('⚠️ Rodrigue n\'a pas reçu de guidance aujourd\'hui');
      
      // 3. Vérifier les guidances récentes
      console.log('\n3️⃣ Vérification des guidances récentes...');
      const { data: recentGuidance, error: recentError } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', rodrigueProfile.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentError) {
        console.error('❌ Erreur pour les guidances récentes:', recentError.message);
      } else if (recentGuidance) {
        console.log(`📅 Dernière guidance reçue: ${recentGuidance.date}`);
        console.log(`   📝 Résumé: ${recentGuidance.summary.substring(0, 100)}...`);
      } else {
        console.log('❌ Aucune guidance trouvée pour Rodrigue');
      }
    }

    // 4. Vérifier si le profil est configuré pour recevoir des SMS
    console.log('\n4️⃣ Vérification de la configuration SMS...');
    
    if (!rodrigueProfile.phone) {
      console.log('❌ Problème: Pas de numéro de téléphone');
    } else if (!rodrigueProfile.natal_chart) {
      console.log('❌ Problème: Pas de thème natal calculé');
    } else if (!rodrigueProfile.daily_guidance_sms_enabled) {
      console.log('❌ Problème: SMS quotidien non activé');
    } else if (rodrigueProfile.subscription_status === 'expired') {
      console.log('❌ Problème: Abonnement expiré');
    } else {
      console.log('✅ Profil correctement configuré pour les SMS');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécution
checkRodrigueGuidance().then(() => {
  console.log('\n🏁 Vérification terminée');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 