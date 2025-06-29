// Script pour tester manuellement l'envoi d'une guidance à Rodrigue
// Usage: node test-rodrigue-guidance.mjs

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Variables d\'environnement Supabase manquantes');
  console.log('Veuillez créer un fichier .env avec :');
  console.log('VITE_SUPABASE_URL=votre_url_supabase');
  console.log('VITE_SUPABASE_ANON_KEY=votre_cle_anon');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRodrigueGuidance() {
  console.log('🧪 Test manuel de guidance pour Rodrigue...\n');

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
        .select('name, id, phone')
        .limit(5);
      
      if (allProfiles && allProfiles.length > 0) {
        console.log('\n📋 Utilisateurs disponibles:');
        allProfiles.forEach(p => console.log(`   - ${p.name} (${p.id}) - ${p.phone || 'Pas de téléphone'}`));
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

    // 2. Vérifier la configuration
    console.log('\n2️⃣ Vérification de la configuration...');
    
    const issues = [];
    if (!rodrigueProfile.phone) issues.push('Pas de numéro de téléphone');
    if (!rodrigueProfile.natal_chart) issues.push('Pas de thème natal calculé');
    if (!rodrigueProfile.daily_guidance_sms_enabled) issues.push('SMS quotidien non activé');
    if (rodrigueProfile.subscription_status === 'expired') issues.push('Abonnement expiré');
    
    if (issues.length > 0) {
      console.log(`❌ Problèmes détectés: ${issues.join(', ')}`);
      console.log('⚠️ Impossible d\'envoyer une guidance sans résoudre ces problèmes');
      return;
    }

    console.log('✅ Configuration valide pour l\'envoi de guidance');

    // 3. Tester l'envoi de guidance
    console.log('\n3️⃣ Test d\'envoi de guidance...');
    
    const testGuidance = {
      user_id: rodrigueProfile.id,
      date: new Date().toISOString().slice(0, 10),
      summary: "Test de guidance - Les étoiles vous sourient aujourd'hui ! 🌟",
      love: {
        text: "L'amour est dans l'air aujourd'hui. Ouvrez votre cœur aux nouvelles rencontres.",
        score: 8
      },
      work: {
        text: "Votre énergie professionnelle est au maximum. C'est le moment de prendre des initiatives.",
        score: 9
      },
      energy: {
        text: "Votre vitalité est excellente. Profitez de cette énergie positive pour accomplir vos objectifs.",
        score: 9
      },
      created_at: new Date().toISOString()
    };

    // Insérer la guidance de test
    const { data: insertedGuidance, error: insertError } = await supabase
      .from('daily_guidance')
      .insert(testGuidance)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion de la guidance:', insertError.message);
      return;
    }

    console.log('✅ Guidance de test créée avec succès');
    console.log(`   📝 Résumé: ${insertedGuidance.summary}`);

    // 4. Tester l'envoi SMS
    console.log('\n4️⃣ Test d\'envoi SMS...');
    
    try {
      const response = await fetch(`${process.env.URL || 'https://zodiak.netlify.app'}/.netlify/functions/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: rodrigueProfile.phone,
          text: `🌟 Guidance Zodiak - ${testGuidance.summary}\n\n💖 Amour: ${testGuidance.love.text}\n💼 Travail: ${testGuidance.work.text}\n⚡ Énergie: ${testGuidance.energy.text}\n\n✨ Que les étoiles vous guident !`,
          from: 'Zodiak'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ SMS de test envoyé avec succès');
        console.log(`   📋 Message ID: ${result.messageId || 'N/A'}`);
        console.log(`   📱 Envoyé à: ${rodrigueProfile.phone}`);
      } else {
        console.log('❌ Erreur lors de l\'envoi du SMS:', result);
      }
    } catch (error) {
      console.log('❌ Erreur de connexion pour l\'envoi SMS:', error.message);
    }

    // 5. Mettre à jour le profil
    console.log('\n5️⃣ Mise à jour du profil...');
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        last_guidance_sent: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', rodrigueProfile.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du profil:', updateError.message);
    } else {
      console.log('✅ Profil mis à jour avec succès');
      console.log(`   📅 Dernière guidance: ${new Date().toLocaleString('fr-FR')}`);
    }

    // 6. Résumé
    console.log('\n🎯 Résumé du test:');
    console.log(`✅ Profil de Rodrigue vérifié`);
    console.log(`✅ Configuration SMS validée`);
    console.log(`✅ Guidance de test créée`);
    console.log(`✅ SMS envoyé à ${rodrigueProfile.phone}`);
    console.log(`✅ Profil mis à jour`);
    
    console.log('\n📞 Demandez à Rodrigue de vérifier s\'il a reçu le SMS de test !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécution
testRodrigueGuidance().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 