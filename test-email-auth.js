// Script pour tester l'authentification par email
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailAuth() {
  console.log('🔍 Test de l\'authentification par email\n');

  const testEmail = 'rodrigue.etifier@gmail.com';
  const testPassword = 'TestPassword123!';

  try {
    // 1. Test d'inscription
    console.log('1️⃣ Test d\'inscription...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      console.log('❌ Erreur d\'inscription:', signUpError.message);
    } else if (signUpData.user) {
      console.log('✅ Inscription réussie pour:', signUpData.user.email);
      console.log('   📧 Email de confirmation envoyé');
    }

    // 2. Test de connexion (peut échouer si email non confirmé)
    console.log('\n2️⃣ Test de connexion...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Erreur de connexion:', signInError.message);
      if (signInError.message.includes('Email not confirmed')) {
        console.log('   ℹ️  Normal - l\'email doit être confirmé d\'abord');
      }
    } else if (signInData.user) {
      console.log('✅ Connexion réussie pour:', signInData.user.email);
    }

    // 3. Test de récupération de mot de passe
    console.log('\n3️⃣ Test de récupération de mot de passe...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://zodiak.netlify.app/login'
    });

    if (resetError) {
      console.log('❌ Erreur de récupération:', resetError.message);
    } else {
      console.log('✅ Email de récupération envoyé');
    }

    // 4. Vérification de la session
    console.log('\n4️⃣ Vérification de la session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Erreur de session:', sessionError.message);
    } else if (session) {
      console.log('✅ Session active pour:', session.user.email);
    } else {
      console.log('ℹ️  Aucune session active');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

testEmailAuth(); 