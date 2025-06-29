import { createClient } from '@supabase/supabase-js';

// Configuration manuelle - remplacez par vos vraies valeurs
const SUPABASE_URL = 'https://your-project.supabase.co'; // Remplacez par votre URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Remplacez par votre clé

console.log('🔍 Vérification de la guidance de Rodrigue Etifier...\n');

// Vérifier la configuration
if (SUPABASE_URL === 'https://your-project.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key') {
  console.log('❌ Configuration manquante');
  console.log('Veuillez modifier ce fichier avec vos vraies valeurs Supabase :');
  console.log('1. Allez sur https://supabase.com/dashboard');
  console.log('2. Sélectionnez votre projet');
  console.log('3. Allez dans Settings > API');
  console.log('4. Copiez l\'URL et la clé anon');
  console.log('5. Remplacez les valeurs dans ce fichier');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRodrigueGuidance() {
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
        .limit(10);
      
      if (allProfiles && allProfiles.length > 0) {
        console.log('\n📋 Utilisateurs disponibles:');
        allProfiles.forEach(p => console.log(`   - ${p.name} (${p.id})`));
      } else {
        console.log('❌ Aucun utilisateur trouvé dans la base de données');
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
    
    const issues = [];
    if (!rodrigueProfile.phone) issues.push('Pas de numéro de téléphone');
    if (!rodrigueProfile.natal_chart) issues.push('Pas de thème natal calculé');
    if (!rodrigueProfile.daily_guidance_sms_enabled) issues.push('SMS quotidien non activé');
    if (rodrigueProfile.subscription_status === 'expired') issues.push('Abonnement expiré');
    
    if (issues.length > 0) {
      console.log(`❌ Problèmes détectés: ${issues.join(', ')}`);
    } else {
      console.log('✅ Profil correctement configuré pour les SMS');
    }

    // 5. Vérifier les SMS envoyés récemment
    console.log('\n5️⃣ Vérification des SMS récents...');
    const { data: recentSMS, error: smsError } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('user_id', rodrigueProfile.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (smsError) {
      console.log('ℹ️ Pas de table sms_logs ou erreur d\'accès');
    } else if (recentSMS && recentSMS.length > 0) {
      console.log('📱 SMS récents envoyés:');
      recentSMS.forEach(sms => {
        console.log(`   📅 ${sms.created_at}: ${sms.status}`);
      });
    } else {
      console.log('ℹ️ Aucun SMS trouvé dans les logs');
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