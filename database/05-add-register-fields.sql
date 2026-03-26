-- =============================================
-- EUROFILES - Add register fields to profiles
-- Run this in Supabase SQL Editor
-- =============================================

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_reg TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip TEXT;

-- Update the trigger function to save all registration data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, first_name, last_name, email, phone,
    is_private, company, company_reg, vat_number,
    country, city, address, zip
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'is_private')::BOOLEAN, FALSE),
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'company_reg',
    NEW.raw_user_meta_data->>'vat_number',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'zip'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
