import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement avec des messages d'erreur plus informatifs
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please check your .env.local file.');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.');
}

console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// Re-export types
export type { Database };
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DailyGuidance = Database['public']['Tables']['daily_guidance']['Row'];