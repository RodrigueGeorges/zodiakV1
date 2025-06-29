// Script de test pour vérifier le système de guidance quotidienne
// Usage: node test-daily-guidance.js

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

async function testDailyGuidanceSystem() {
  console.log('🧪 Test du système de guidance quotidienne...\n');

  try {
    // 1. Vérifier les utilisateurs avec SMS activé
    console.log('1️⃣ Récupération des utilisateurs avec SMS activé...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('daily_guidance_sms_enabled', true)
      .in('subscription_status', ['active', 'trial']);

    if (error) {
      console.error('❌ Erreur lors de la récupération des profils:', error);
      return;
    }

    console.log(`✅ ${profiles?.length || 0} utilisateurs trouvés avec SMS activé\n`);

    if (!profiles || profiles.length === 0) {
      console.log('ℹ️ Aucun utilisateur à tester');
      return;
    }

    // 2. Analyser chaque utilisateur
    console.log('2️⃣ Analyse des profils utilisateurs...');
    for (const profile of profiles) {
      console.log(`\n👤 Utilisateur: ${profile.name} (${profile.id})`);
      console.log(`   📱 Téléphone: ${profile.phone || '❌ Manquant'}`);
      console.log(`   ⏰ Heure de guidance: ${profile.guidance_sms_time || '08:00'}`);
      console.log(`   📊 Statut: ${profile.subscription_status}`);
      console.log(`   🎯 Thème natal: ${profile.natal_chart ? '✅ Présent' : '❌ Manquant'}`);
      console.log(`   📅 Dernière guidance: ${profile.last_guidance_sent || 'Jamais'}`);
      
      // Vérifier les problèmes
      const issues = [];
      if (!profile.phone) issues.push('Numéro de téléphone manquant');
      if (!profile.natal_chart) issues.push('Thème natal manquant');
      if (profile.subscription_status === 'expired') issues.push('Abonnement expiré');
      
      if (issues.length > 0) {
        console.log(`   ⚠️ Problèmes détectés: ${issues.join(', ')}`);
      } else {
        console.log(`   ✅ Profil valide pour les SMS`);
      }
    }

    // 3. Vérifier les guidances existantes
    console.log('\n3️⃣ Vérification des guidances existantes...');
    const today = new Date().toISOString().slice(0, 10);
    
    for (const profile of profiles) {
      const { data: guidance, error: guidanceError } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', today)
        .maybeSingle();

      if (guidanceError) {
        console.log(`❌ Erreur pour ${profile.name}: ${guidanceError.message}`);
      } else if (guidance) {
        console.log(`✅ ${profile.name}: Guidance du jour présente`);
      } else {
        console.log(`⚠️ ${profile.name}: Aucune guidance pour aujourd'hui`);
      }
    }

    // 4. Test de la fonction Netlify
    console.log('\n4️⃣ Test de la fonction Netlify...');
    try {
      const response = await fetch(`${process.env.URL || 'https://zodiak.netlify.app'}/.netlify/functions/send-daily-guidance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Fonction Netlify accessible');
        console.log(`   📊 Résultat: ${JSON.stringify(result, null, 2)}`);
      } else {
        console.log('❌ Erreur de la fonction Netlify:', result);
      }
    } catch (netlifyError) {
      console.log('❌ Impossible d\'accéder à la fonction Netlify:', netlifyError.message);
    }

    // 5. Recommandations
    console.log('\n5️⃣ Recommandations:');
    
    const usersWithoutPhone = profiles.filter(p => !p.phone).length;
    const usersWithoutNatalChart = profiles.filter(p => !p.natal_chart).length;
    const expiredUsers = profiles.filter(p => p.subscription_status === 'expired').length;
    
    if (usersWithoutPhone > 0) {
      console.log(`⚠️ ${usersWithoutPhone} utilisateurs sans numéro de téléphone`);
    }
    
    if (usersWithoutNatalChart > 0) {
      console.log(`⚠️ ${usersWithoutNatalChart} utilisateurs sans thème natal`);
    }
    
    if (expiredUsers > 0) {
      console.log(`⚠️ ${expiredUsers} utilisateurs avec abonnement expiré`);
    }
    
    const validUsers = profiles.filter(p => p.phone && p.natal_chart && p.subscription_status !== 'expired').length;
    console.log(`✅ ${validUsers} utilisateurs prêts à recevoir des SMS`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour simuler l'envoi d'un SMS de test
async function sendTestSMS(phoneNumber) {
  console.log(`\n📱 Test d'envoi SMS à ${phoneNumber}...`);
  
  try {
    const response = await fetch(`${process.env.URL || 'https://zodiak.netlify.app'}/.netlify/functions/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        text: '🧪 Test Zodiak : Le système de guidance quotidienne fonctionne correctement !',
        from: 'Zodiak'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SMS de test envoyé avec succès');
      console.log(`   📋 Message ID: ${result.messageId}`);
    } else {
      console.log('❌ Erreur lors de l\'envoi du SMS:', result);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
}

// Exécution du test
if (require.main === module) {
  testDailyGuidanceSystem().then(() => {
    console.log('\n🏁 Test terminé');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { testDailyGuidanceSystem, sendTestSMS }; 