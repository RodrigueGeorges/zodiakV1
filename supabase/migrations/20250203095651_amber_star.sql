-- Create helper function for phone validation
CREATE OR REPLACE FUNCTION public.validate_phone_format(phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN phone ~ '^\+33[67]\d{8}$';
END;
$$;

-- Recreate create_user_with_phone with proper schema references
CREATE OR REPLACE FUNCTION public.create_user_with_phone(
  phone_number text,
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
  -- Validate phone format
  IF NOT public.validate_phone_format(phone_number) THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be +33 followed by 6 or 7 and 8 digits';
  END IF;

  -- Generate new UUID for user
  new_user_id := gen_random_uuid();

  -- Create user
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

  -- Create initial profile
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

-- Recreate sign_in_with_phone with proper schema references
CREATE OR REPLACE FUNCTION public.sign_in_with_phone(
  phone_number text,
  password text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_user_id uuid;
  result json;
BEGIN
  -- Validate phone format
  IF NOT public.validate_phone_format(phone_number) THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be +33 followed by 6 or 7 and 8 digits';
  END IF;

  -- Get user by phone
  SELECT id INTO found_user_id
  FROM auth.users
  WHERE phone = phone_number;

  -- If user doesn't exist, create one
  IF found_user_id IS NULL THEN
    found_user_id := public.create_user_with_phone(phone_number, password);
  END IF;

  -- Create a new session
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

-- Create RPC endpoint for sign_in_with_phone
CREATE OR REPLACE FUNCTION public.rpc_sign_in_with_phone(
  phone text,
  password text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.sign_in_with_phone(phone, password);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_phone_format TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_with_phone TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_in_with_phone TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sign_in_with_phone TO anon, authenticated;