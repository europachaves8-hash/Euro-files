-- =============================================
-- SQL 12: Add payment tracking fields to orders
-- Run in Supabase SQL Editor
-- =============================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
