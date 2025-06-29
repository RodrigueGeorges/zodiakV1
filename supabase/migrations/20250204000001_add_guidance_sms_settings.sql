/*
  # Add Daily Guidance SMS Settings

  1. Changes to profiles table
    - Add `daily_guidance_sms_enabled` (boolean, default false)
    - Add `guidance_time` (time, default '08:00')
    - Add `last_guidance_sent` (timestamptz, nullable)

  2. Purpose
    - Enable users to toggle daily SMS guidance
    - Allow users to set preferred sending time
    - Track when last guidance was sent to avoid duplicates
*/

-- Add daily_guidance_sms_enabled column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'daily_guidance_sms_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN daily_guidance_sms_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Add guidance_time column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'guidance_time'
  ) THEN
    ALTER TABLE profiles ADD COLUMN guidance_time time DEFAULT '08:00';
  END IF;
END $$;

-- Add last_guidance_sent column (if not already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'last_guidance_sent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_guidance_sent timestamptz;
  END IF;
END $$;

-- Create index for performance on daily_guidance_sms_enabled
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_daily_guidance_sms_enabled_idx') THEN
    CREATE INDEX profiles_daily_guidance_sms_enabled_idx ON profiles(daily_guidance_sms_enabled);
  END IF;
END $$;

-- Create index for performance on guidance_time
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_guidance_time_idx') THEN
    CREATE INDEX profiles_guidance_time_idx ON profiles(guidance_time);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.daily_guidance_sms_enabled IS 'Whether the user has enabled daily SMS guidance';
COMMENT ON COLUMN profiles.guidance_time IS 'Preferred time for daily guidance SMS (HH:MM format)';
COMMENT ON COLUMN profiles.last_guidance_sent IS 'Timestamp of last guidance SMS sent to avoid duplicates'; 