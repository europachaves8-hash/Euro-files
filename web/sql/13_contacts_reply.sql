-- Add reply columns to contacts table
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
