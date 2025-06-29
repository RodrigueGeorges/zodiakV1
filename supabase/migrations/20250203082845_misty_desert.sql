/*
  # Add SMS delivery receipt tracking

  1. New Tables
    - `message_delivery_receipts`
      - `id` (uuid, primary key)
      - `message_id` (text, not null) - Vonage message ID
      - `status` (text, not null) - Current delivery status
      - `error_code` (text) - Error code if delivery failed
      - `timestamp` (timestamptz) - When the status was received
      - `metadata` (jsonb) - Full webhook payload
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for service role to insert
    - Add policy for authenticated users to read their receipts
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_delivery_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  status text NOT NULL,
  error_code text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'message_delivery_receipts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE message_delivery_receipts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Service can insert delivery receipts" ON message_delivery_receipts;
  DROP POLICY IF EXISTS "Users can read delivery receipts" ON message_delivery_receipts;
END $$;

-- Create new policies
CREATE POLICY "Service can insert delivery receipts"
  ON message_delivery_receipts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can read delivery receipts"
  ON message_delivery_receipts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'message_delivery_receipts_message_id_idx') THEN
    CREATE INDEX message_delivery_receipts_message_id_idx ON message_delivery_receipts(message_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'message_delivery_receipts_status_idx') THEN
    CREATE INDEX message_delivery_receipts_status_idx ON message_delivery_receipts(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'message_delivery_receipts_timestamp_idx') THEN
    CREATE INDEX message_delivery_receipts_timestamp_idx ON message_delivery_receipts(timestamp DESC);
  END IF;
END $$;