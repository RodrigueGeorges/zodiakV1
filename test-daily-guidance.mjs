// Script de test pour vérifier le système de guidance quotidienne
// Usage: node test-daily-guidance.mjs

import { createClient } from '@supabase/supabase-js';

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
        console.log(`   📝 Résumé: ${guidance.summary.substring(0, 100)}...`);
      } else {
        console.log(`⚠️ ${profile.name}: Aucune guidance pour aujourd'hui`);
      }
    }

    // 4. Rechercher spécifiquement Rodrigue Etifier
    console.log('\n4️⃣ Recherche spécifique de Rodrigue Etifier...');
    const { data: rodrigueProfile, error: rodrigueError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('name', '%Rodrigue%')
      .maybeSingle();

    if (rodrigueError) {
      console.log(`❌ Erreur lors de la recherche de Rodrigue: ${rodrigueError.message}`);
    } else if (rodrigueProfile) {
      console.log(`\n🎯 Profil trouvé: ${rodrigueProfile.name}`);
      console.log(`   📱 Téléphone: ${rodrigueProfile.phone || '❌ Manquant'}`);
      console.log(`   📊 Statut: ${rodrigueProfile.subscription_status}`);
      console.log(`   🔔 SMS activé: ${rodrigueProfile.daily_guidance_sms_enabled ? '✅ Oui' : '❌ Non'}`);
      console.log(`   ⏰ Heure: ${rodrigueProfile.guidance_sms_time || '08:00'}`);
      console.log(`   📅 Dernière guidance: ${rodrigueProfile.last_guidance_sent || 'Jamais'}`);
      
      // Vérifier sa guidance d'aujourd'hui
      const { data: rodrigueGuidance, error: guidanceError } = await supabase
        .from('daily_guidance')
        .select('*')
        .eq('user_id', rodrigueProfile.id)
        .eq('date', today)
        .maybeSingle();

      if (guidanceError) {
        console.log(`❌ Erreur pour la guidance de Rodrigue: ${guidanceError.message}`);
      } else if (rodrigueGuidance) {
        console.log(`✅ Rodrigue a reçu sa guidance aujourd'hui !`);
        console.log(`   📝 Résumé: ${rodrigueGuidance.summary}`);
        console.log(`   💖 Amour: ${typeof rodrigueGuidance.love === 'string' ? rodrigueGuidance.love : rodrigueGuidance.love?.text || 'N/A'}`);
        console.log(`   💼 Travail: ${typeof rodrigueGuidance.work === 'string' ? rodrigueGuidance.work : rodrigueGuidance.work?.text || 'N/A'}`);
        console.log(`   ⚡ Énergie: ${typeof rodrigueGuidance.energy === 'string' ? rodrigueGuidance.energy : rodrigueGuidance.energy?.text || 'N/A'}`);
      } else {
        console.log(`⚠️ Rodrigue n'a pas reçu de guidance aujourd'hui`);
        
        // Vérifier les guidances récentes
        const { data: recentGuidance, error: recentError } = await supabase
          .from('daily_guidance')
          .select('*')
          .eq('user_id', rodrigueProfile.id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentError) {
          console.log(`❌ Erreur pour les guidances récentes: ${recentError.message}`);
        } else if (recentGuidance) {
          console.log(`📅 Dernière guidance reçue: ${recentGuidance.date}`);
        } else {
          console.log(`❌ Aucune guidance trouvée pour Rodrigue`);
        }
      }
    } else {
      console.log(`❌ Aucun utilisateur nommé "Rodrigue" trouvé`);
      
      // Lister tous les utilisateurs pour aider à la recherche
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('name, id')
        .limit(10);

      if (!allError && allProfiles) {
        console.log(`\n📋 Utilisateurs disponibles:`);
        allProfiles.forEach(p => console.log(`   - ${p.name} (${p.id})`));
      }
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
testDailyGuidanceSystem().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 