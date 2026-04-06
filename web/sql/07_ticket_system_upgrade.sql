-- =============================================
-- SQL 07: Upgrade orders table + ticket files/messages
-- Adds all fields needed by the new 5-step ticket creation wizard
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Add missing columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'car',
  ADD COLUMN IF NOT EXISTS vehicle_year TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_gearbox TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_fuel TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_vin TEXT,
  ADD COLUMN IF NOT EXISTS ecu_producer TEXT,
  ADD COLUMN IF NOT EXISTS ecu_type TEXT,
  ADD COLUMN IF NOT EXISTS ecu_hardware_no TEXT,
  ADD COLUMN IF NOT EXISTS ecu_software_no TEXT,
  ADD COLUMN IF NOT EXISTS ecu_update_no TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_plate TEXT,
  ADD COLUMN IF NOT EXISTS reading_tool TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS price_eur NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent'));

-- 2. Ticket files table (stores original + modified ECU files)
CREATE TABLE IF NOT EXISTS public.ticket_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT DEFAULT 'original' CHECK (file_type IN ('original', 'modified', 'attachment')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ticket messages table (in-ticket chat)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_role TEXT DEFAULT 'client' CHECK (sender_role IN ('admin', 'client')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_files_order ON public.ticket_files(order_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_order ON public.ticket_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 5. RLS policies for ticket_files
ALTER TABLE public.ticket_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ticket files" ON public.ticket_files
  FOR SELECT USING (
    uploaded_by = auth.uid()
    OR order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can upload to own tickets" ON public.ticket_files
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- 6. RLS policies for ticket_messages
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages
  FOR SELECT USING (
    user_id = auth.uid()
    OR order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can send messages on own tickets" ON public.ticket_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- 7. Enable realtime for ticket_messages (for chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- 8. Storage bucket for ticket files (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-files', 'ticket-files', false)
-- ON CONFLICT DO NOTHING;
