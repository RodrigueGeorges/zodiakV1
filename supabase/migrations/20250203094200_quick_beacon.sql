-- Enable phone auth in auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone text UNIQUE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_confirmed_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change_token text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change_at timestamptz;

-- Create auth function for phone sign up in public schema
CREATE OR REPLACE FUNCTION public.create_user_with_phone(
  phone text,
  password text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user
  INSERT INTO auth.users (
    phone,
    phone_confirmed_at,
    encrypted_password,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    phone,
    now(),
    CASE WHEN password IS NULL THEN NULL 
    ELSE crypt(password, gen_salt('bf')) END,
    '{"provider":"phone","providers":["phone"]}',
    '{}',
    now(),
    now()
  )
  RETURNING id INTO new_user_id;

  -- Create empty profile
  INSERT INTO public.profiles (id, phone)
  VALUES (new_user_id, phone);

  RETURN new_user_id;
END;
$$;

-- Create auth function for phone sign in in public schema
CREATE OR REPLACE FUNCTION public.sign_in_with_phone(
  phone text,
  password text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  result json;
BEGIN
  -- Get user by phone
  SELECT id INTO user_id
  FROM auth.users
  WHERE users.phone = sign_in_with_phone.phone;

  -- If user doesn't exist, create one
  IF user_id IS NULL THEN
    user_id := public.create_user_with_phone(phone, password);
  END IF;

  -- Create a new session
  INSERT INTO auth.sessions (user_id, created_at)
  VALUES (user_id, now())
  RETURNING json_build_object(
    'user', json_build_object(
      'id', user_id,
      'phone', phone
    ),
    'session', json_build_object(
      'access_token', encode(gen_random_bytes(32), 'base64'),
      'token_type', 'bearer',
      'expires_in', 3600
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_user_with_phone TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_in_with_phone TO anon, authenticated;

-- Create trigger for phone validation
CREATE OR REPLACE FUNCTION public.validate_phone()
RETURNS trigger AS $$
BEGIN
  IF NEW.phone IS NOT NULL AND NOT NEW.phone ~ '^\+33[67]\d{8}$' THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be +33 followed by 6 or 7 and 8 digits';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_phone_trigger ON auth.users;
CREATE TRIGGER validate_phone_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_phone();