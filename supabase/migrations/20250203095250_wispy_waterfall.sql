-- Modify columns to be nullable
ALTER TABLE public.profiles
  ALTER COLUMN birth_date DROP NOT NULL,
  ALTER COLUMN birth_time DROP NOT NULL,
  ALTER COLUMN birth_place DROP NOT NULL;

-- Update create_user_with_phone function to handle nullable fields
CREATE OR REPLACE FUNCTION public.create_user_with_phone(
  phone text,
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
    phone,
    now(),
    CASE WHEN password IS NULL THEN NULL 
    ELSE crypt(password, gen_salt('bf', 8)) END,
    '{"provider":"phone","providers":["phone"]}',
    '{}',
    now(),
    now()
  );

  -- Create initial profile with only required fields
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
    phone,
    'Nouveau membre',
    now() + interval '7 days',
    'trial',
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;