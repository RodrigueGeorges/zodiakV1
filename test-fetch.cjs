const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://omvkqmuetruojtwqpbal.supabase.co/rest/v1/profiles';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'TA_CLE_SUPABASE_ANNONCE_ICI';

fetch(SUPABASE_URL, {
  headers: { apikey: SUPABASE_KEY }
})
.then(res => res.text())
.then(console.log)
.catch(console.error); 