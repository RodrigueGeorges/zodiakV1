/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_ASTRO_API_URL: string;
  readonly VITE_ASTRO_CLIENT_ID: string;
  readonly VITE_ASTRO_CLIENT_SECRET: string;
  readonly VITE_VONAGE_API_KEY: string;
  readonly VITE_VONAGE_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}