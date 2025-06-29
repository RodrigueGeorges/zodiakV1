-- Drop existing functions to recreate them with fixed column references
DROP FUNCTION IF EXISTS public.sign_in_with_phone(text, text);
DROP FUNCTION IF EXISTS public.create_user_with_phone(text, text);

-- Recreate create_user_with_phone with explicit column references
CREATE OR REPLACE FUNCTION public.create_user_with_phone(
  phone_number text,
  password text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generate new UUID for user
  new_user_id := gen_random_uuid();

  -- Create user with explicit column names
  INSERT INTO auth.users (
    id,
    phone,
    phone_confirmed_at,
    encrypted_password,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    phone_number,
    now(),
    CASE WHEN password IS NULL THEN NULL 
    ELSE crypt(password, gen_salt('bf', 8)) END,
    '{"provider":"phone","providers":["phone"]}',
    '{}',
    now(),
    now()
  );

  -- Create initial profile with explicit column names
  INSERT INTO public.profiles (
    id,
    phone,
    name,
    trial_ends_at,
    subscription_status,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    phone_number,
    'Nouveau membre',
    now() + interval '7 days',
    'trial',
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- Recreate sign_in_with_phone with explicit column references
CREATE OR REPLACE FUNCTION public.sign_in_with_phone(
  phone_number text,
  password text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  found_user_id uuid;
  result json;
BEGIN
  -- Get user by phone with explicit table reference
  SELECT u.id INTO found_user_id
  FROM auth.users u
  WHERE u.phone = phone_number;

  -- If user doesn't exist, create one
  IF found_user_id IS NULL THEN
    found_user_id := public.create_user_with_phone(phone_number, password);
  END IF;

  -- Create a new session with explicit column names
  INSERT INTO auth.sessions (
    id,
    user_id,
    created_at,
    not_after
  )
  VALUES (
    gen_random_uuid(),
    found_user_id,
    now(),
    now() + interval '7 days'
  )
  RETURNING json_build_object(
    'user', json_build_object(
      'id', found_user_id,
      'phone', phone_number
    ),
    'session', json_build_object(
      'access_token', encode(gen_random_bytes(32), 'base64'),
      'token_type', 'bearer',
      'expires_in', extract(epoch from interval '7 days')::integer
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_user_with_phone TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_in_with_phone TO anon, authenticated;