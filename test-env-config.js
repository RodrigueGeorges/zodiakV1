// Script pour tester la configuration des variables d'environnement
console.log('🔍 Test de configuration des variables d\'environnement');

// Variables Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('📊 Variables Supabase:');
console.log('  VITE_SUPABASE_URL:', supabaseUrl ? '✅ Présent' : '❌ Manquant');
console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Présent' : '❌ Manquant');

// Variables Brevo
const brevoApiKey = process.env.VITE_BREVO_API_KEY;
console.log('📱 Variables Brevo:');
console.log('  VITE_BREVO_API_KEY:', brevoApiKey ? '✅ Présent' : '❌ Manquant');

// Variables OpenAI
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
console.log('🤖 Variables OpenAI:');
console.log('  VITE_OPENAI_API_KEY:', openaiApiKey ? '✅ Présent' : '❌ Manquant');

// Variables Astro
const astroApiUrl = process.env.VITE_ASTRO_API_URL;
const astroClientId = process.env.VITE_ASTRO_CLIENT_ID;
const astroClientSecret = process.env.VITE_ASTRO_CLIENT_SECRET;

console.log('⭐ Variables Astro:');
console.log('  VITE_ASTRO_API_URL:', astroApiUrl ? '✅ Présent' : '❌ Manquant');
console.log('  VITE_ASTRO_CLIENT_ID:', astroClientId ? '✅ Présent' : '❌ Manquant');
console.log('  VITE_ASTRO_CLIENT_SECRET:', astroClientSecret ? '✅ Présent' : '❌ Manquant');

// Test de connexion Supabase
if (supabaseUrl && supabaseAnonKey) {
  console.log('\n🔗 Test de connexion Supabase...');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Erreur de connexion Supabase:', error.message);
      } else {
        console.log('✅ Connexion Supabase réussie');
      }
    })
    .catch(err => {
      console.log('❌ Erreur lors du test Supabase:', err.message);
    });
} else {
  console.log('\n❌ Impossible de tester Supabase - variables manquantes');
} 