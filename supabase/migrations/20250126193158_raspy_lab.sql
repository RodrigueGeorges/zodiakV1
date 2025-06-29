/*
  # Create users and user profiles tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `phone` (text)
      - `birth_date` (date)
      - `birth_time` (time)
      - `birth_place` (text)
      - `natal_chart` (jsonb)
      - `trial_ends_at` (timestamptz)
      - `subscription_status` (text)
      - `last_guidance_sent` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to read and update their own data
*/

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  birth_place text NOT NULL,
  natal_chart jsonb,
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  subscription_status text NOT NULL DEFAULT 'trial',
  last_guidance_sent timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Function to automatically set updated_at on update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();