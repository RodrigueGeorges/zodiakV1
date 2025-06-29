-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.rpc_sign_in_with_phone(text);
DROP FUNCTION IF EXISTS public.validate_phone_format(text);

-- Create helper function for phone validation
CREATE OR REPLACE FUNCTION public.validate_phone_format(input_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN input_phone ~ '^\+33[67]\d{8}$';
END;
$$;

-- Create RPC function for phone sign in with a single parameter
CREATE OR REPLACE FUNCTION public.rpc_sign_in_with_phone(input_phone text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_user_id uuid;
  result json;
  session_token text;
BEGIN
  -- Validate phone format
  IF NOT public.validate_phone_format(input_phone) THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be +33 followed by 6 or 7 and 8 digits';
  END IF;

  -- Get user by phone with explicit alias and column reference
  SELECT u.id INTO found_user_id
  FROM auth.users u
  WHERE u.phone = input_phone;

  -- If user doesn't exist, create one
  IF found_user_id IS NULL THEN
    -- Generate new UUID for user
    found_user_id := gen_random_uuid();

    -- Create user with explicit column names
    INSERT INTO auth.users (
      id,
      phone,
      phone_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      found_user_id,
      input_phone,
      now(),
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
      found_user_id,
      input_phone,
      'Nouveau membre',
      now() + interval '7 days',
      'trial',
      now(),
      now()
    );
  END IF;

  -- Generate session token using pgcrypto
  SELECT encode(public.gen_random_bytes(32), 'base64') INTO session_token;

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
      'phone', input_phone
    ),
    'session', json_build_object(
      'access_token', session_token,
      'token_type', 'bearer',
      'expires_in', extract(epoch from interval '7 days')::integer
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_phone_format TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sign_in_with_phone TO anon, authenticated;