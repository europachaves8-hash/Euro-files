-- =============================================
-- SQL 09: Fix profile creation trigger
-- Copies registration data from user_metadata to profiles table
-- Run in Supabase SQL Editor
-- =============================================

-- Add missing columns to profiles (if not present)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS company_reg TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT,
  ADD COLUMN IF NOT EXISTS zip TEXT;

-- Replace the trigger function to copy registration data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, first_name, last_name, phone, is_private,
    company, company_reg, vat_number,
    country, city, address, postal_code, zip
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    COALESCE((new.raw_user_meta_data->>'is_private')::boolean, true),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'company_reg',
    new.raw_user_meta_data->>'vat_number',
    COALESCE(new.raw_user_meta_data->>'country', 'Portugal'),
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'zip',
    new.raw_user_meta_data->>'zip'
  );
  RETURN new;
END;
$$;

-- The trigger itself (on_auth_user_created) already exists,
-- so just replacing the function above is enough.
