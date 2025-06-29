/*
  # Create daily guidance table

  1. New Tables
    - `daily_guidance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date)
      - `summary` (text)
      - `love` (text)
      - `work` (text)
      - `energy` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `daily_guidance` table
    - Add policy for authenticated users to read their own guidance
*/

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

ALTER TABLE daily_guidance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own guidance"
  ON daily_guidance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);