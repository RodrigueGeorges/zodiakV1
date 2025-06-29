/*
  # Daily Guidance Schema

  1. Changes
    - Add IF NOT EXISTS checks
    - Add safe schema updates
    - Add indexes for performance
    
  2. Security
    - Enable RLS
    - Add read policy for authenticated users
*/

-- Safely create daily guidance table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'daily_guidance'
  ) THEN
    CREATE TABLE daily_guidance (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      date date NOT NULL DEFAULT CURRENT_DATE,
      summary text NOT NULL,
      love text NOT NULL,
      work text NOT NULL,
      energy text NOT NULL,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, date)
    );
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'daily_guidance' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE daily_guidance ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create or replace RLS policies
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can read own guidance" ON daily_guidance;

  -- Create new policy
  CREATE POLICY "Users can read own guidance"
    ON daily_guidance
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Safely create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'daily_guidance_user_id_idx') THEN
    CREATE INDEX daily_guidance_user_id_idx ON daily_guidance(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'daily_guidance_date_idx') THEN
    CREATE INDEX daily_guidance_date_idx ON daily_guidance(date);
  END IF;
END $$;