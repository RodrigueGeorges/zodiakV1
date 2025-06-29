/*
  # Update Profiles Schema

  1. Changes
    - Add IF NOT EXISTS checks
    - Add safe schema updates
    - Update RLS policies safely
    
  2. Security
    - Preserve existing RLS policies
    - Add new policies if needed
*/

-- Safely create profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name text NOT NULL,
      phone text NOT NULL,
      birth_date date NOT NULL,
      birth_time time NOT NULL,
      birth_place text NOT NULL,
      natal_chart jsonb,
      trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
      subscription_status text NOT NULL DEFAULT 'trial',
      last_guidance_sent timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Safely add columns if they don't exist
DO $$ 
BEGIN
  -- Add trial_ends_at if missing
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days');
  END IF;

  -- Add subscription_status if missing
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN subscription_status text NOT NULL DEFAULT 'trial';
  END IF;

  -- Add last_guidance_sent if missing
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'last_guidance_sent'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN last_guidance_sent timestamptz;
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create or replace RLS policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

  -- Create new policies
  CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
END $$;

-- Safely create or replace updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();