/*
  # Messages and Delivery Receipts Schema

  1. New Tables
    - inbound_messages: Store incoming SMS messages
    - message_delivery_receipts: Track message delivery status
  
  2. Security
    - Enable RLS on both tables
    - Add policies for service role and authenticated users
    
  3. Indexes
    - Add performance indexes for common queries
    
  4. Functions
    - Add helper functions for message processing
*/

-- Safely create inbound messages table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'inbound_messages'
  ) THEN
    CREATE TABLE inbound_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "from" text NOT NULL,
      text text NOT NULL,
      timestamp timestamptz NOT NULL DEFAULT now(),
      user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      status text NOT NULL DEFAULT 'received',
      metadata jsonb,
      error text,
      processed_at timestamptz,
      created_at timestamptz DEFAULT now(),
      CONSTRAINT inbound_messages_status_check 
        CHECK (status IN ('received', 'processed', 'error'))
    );
  END IF;
END $$;

-- Safely create delivery receipts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'message_delivery_receipts'
  ) THEN
    CREATE TABLE message_delivery_receipts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id text NOT NULL,
      status text NOT NULL,
      error_code text,
      timestamp timestamptz NOT NULL DEFAULT now(),
      metadata jsonb,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'inbound_messages' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE inbound_messages ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'message_delivery_receipts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE message_delivery_receipts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create or replace RLS policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own messages" ON inbound_messages;
  DROP POLICY IF EXISTS "Service can insert messages" ON inbound_messages;
  DROP POLICY IF EXISTS "Service can insert delivery receipts" ON message_delivery_receipts;
  DROP POLICY IF EXISTS "Users can read delivery receipts" ON message_delivery_receipts;

  -- Create new policies
  CREATE POLICY "Users can read own messages"
    ON inbound_messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Service can insert messages"
    ON inbound_messages
    FOR INSERT
    TO service_role
    WITH CHECK (true);

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
END $$;

-- Safely create indexes if they don't exist
DO $$ 
BEGIN
  -- Indexes for inbound_messages
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'inbound_messages_user_id_idx') THEN
    CREATE INDEX inbound_messages_user_id_idx ON inbound_messages(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'inbound_messages_timestamp_idx') THEN
    CREATE INDEX inbound_messages_timestamp_idx ON inbound_messages(timestamp DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'inbound_messages_status_idx') THEN
    CREATE INDEX inbound_messages_status_idx ON inbound_messages(status);
  END IF;

  -- Indexes for message_delivery_receipts
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

-- Safely create or replace helper functions
CREATE OR REPLACE FUNCTION mark_message_processed(
  message_id uuid,
  metadata_json jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE inbound_messages
  SET 
    status = 'processed',
    metadata = metadata_json,
    processed_at = now()
  WHERE id = message_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_message_error(
  message_id uuid,
  error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE inbound_messages
  SET 
    status = 'error',
    error = error_message,
    processed_at = now()
  WHERE id = message_id;
END;
$$;