/*
  # Enable Phone Authentication

  1. Changes
    - Add phone number columns to auth.users
    - Create phone validation function and trigger
    - Add phone sign-in function
    - Add rate limiting table and functions
  
  2. Security
    - Validate phone numbers format
    - Ensure phone numbers are unique
    - Rate limit sign-in attempts
    - Auto cleanup of old rate limit entries
*/

-- Enable phone auth provider
ALTER TABLE auth.users 
  ADD COLUMN IF NOT EXISTS phone text UNIQUE,
  ADD COLUMN IF NOT EXISTS phone_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS phone_change_token text,
  ADD COLUMN IF NOT EXISTS phone_change_at timestamptz;

-- Create function to validate phone numbers
CREATE OR REPLACE FUNCTION auth.validate_phone()
RETURNS trigger AS $$
BEGIN
  IF NEW.phone IS NOT NULL AND NOT NEW.phone ~ '^\+33[67]\d{8}$' THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be +33 followed by 6 or 7 and 8 digits';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for phone validation
DROP TRIGGER IF EXISTS validate_phone_trigger ON auth.users;
CREATE TRIGGER validate_phone_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.validate_phone();

-- Create function for phone sign in
CREATE OR REPLACE FUNCTION auth.sign_in_with_phone(
  phone text,
  password text
) RETURNS json AS $$
DECLARE
  _user auth.users;
  result json;
BEGIN
  -- Get user by phone
  SELECT * INTO _user
  FROM auth.users
  WHERE users.phone = sign_in_with_phone.phone;

  -- If user doesn't exist, create one
  IF _user.id IS NULL THEN
    INSERT INTO auth.users (phone, encrypted_password, phone_confirmed_at)
    VALUES (
      sign_in_with_phone.phone,
      crypt(sign_in_with_phone.password, gen_salt('bf')),
      now()
    )
    RETURNING * INTO _user;
  END IF;

  -- Create a new session
  INSERT INTO auth.sessions (user_id, created_at)
  VALUES (_user.id, now())
  RETURNING json_build_object(
    'user', json_build_object(
      'id', _user.id,
      'phone', _user.phone
    ),
    'session', json_build_object(
      'access_token', encode(gen_random_bytes(32), 'base64'),
      'token_type', 'bearer',
      'expires_in', 3600
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage to anon and authenticated roles
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.sign_in_with_phone TO anon, authenticated;

-- Add rate limiting for phone auth
CREATE TABLE IF NOT EXISTS auth.phone_sign_in_attempts (
  phone text NOT NULL,
  attempt_count int DEFAULT 1,
  last_attempt_at timestamptz DEFAULT now(),
  PRIMARY KEY (phone)
);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION auth.check_phone_rate_limit(phone text)
RETURNS boolean AS $$
DECLARE
  _attempts auth.phone_sign_in_attempts;
  _max_attempts constant int := 5;
  _window_minutes constant int := 15;
BEGIN
  -- Get current attempts
  SELECT * INTO _attempts
  FROM auth.phone_sign_in_attempts
  WHERE phone_sign_in_attempts.phone = check_phone_rate_limit.phone;

  -- If no attempts yet, allow
  IF _attempts.phone IS NULL THEN
    INSERT INTO auth.phone_sign_in_attempts (phone)
    VALUES (check_phone_rate_limit.phone);
    RETURN true;
  END IF;

  -- Reset if window has passed
  IF _attempts.last_attempt_at < now() - (_window_minutes || ' minutes')::interval THEN
    UPDATE auth.phone_sign_in_attempts
    SET attempt_count = 1, last_attempt_at = now()
    WHERE phone = check_phone_rate_limit.phone;
    RETURN true;
  END IF;

  -- Increment attempts
  UPDATE auth.phone_sign_in_attempts
  SET attempt_count = attempt_count + 1, last_attempt_at = now()
  WHERE phone = check_phone_rate_limit.phone;

  -- Check if limit exceeded
  RETURN _attempts.attempt_count < _max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old rate limit entries
CREATE OR REPLACE FUNCTION auth.cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM auth.phone_sign_in_attempts
  WHERE last_attempt_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION auth.check_phone_rate_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.cleanup_rate_limits TO postgres;