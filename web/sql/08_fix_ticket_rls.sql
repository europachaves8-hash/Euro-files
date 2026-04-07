-- =============================================
-- SQL 08: Fix ticket_messages & ticket_files RLS policies
-- The old policies queried auth.users directly (forbidden)
-- and checked wrong field (raw_user_meta_data->>'role')
-- This uses get_my_claim('userrole') like the rest of the app
-- Run in Supabase SQL Editor
-- =============================================

-- ===== DROP old broken policies =====
DROP POLICY IF EXISTS "Users can view own ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can send messages on own tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can view own ticket files" ON public.ticket_files;
DROP POLICY IF EXISTS "Users can upload to own tickets" ON public.ticket_files;

-- ===== TICKET MESSAGES =====

-- Admin can read all messages
CREATE POLICY "admin_read_all_ticket_messages" ON public.ticket_messages
  FOR SELECT USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Client can read messages on own tickets
CREATE POLICY "user_read_own_ticket_messages" ON public.ticket_messages
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- Admin can send messages on any ticket
CREATE POLICY "admin_insert_ticket_messages" ON public.ticket_messages
  FOR INSERT WITH CHECK (get_my_claim('userrole')::text = '"ADMIN"');

-- Client can send messages on own tickets
CREATE POLICY "user_insert_own_ticket_messages" ON public.ticket_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- ===== TICKET FILES =====

-- Admin can view all files
CREATE POLICY "admin_read_all_ticket_files" ON public.ticket_files
  FOR SELECT USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Client can view files on own tickets
CREATE POLICY "user_read_own_ticket_files" ON public.ticket_files
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- Admin can upload files to any ticket
CREATE POLICY "admin_insert_ticket_files" ON public.ticket_files
  FOR INSERT WITH CHECK (get_my_claim('userrole')::text = '"ADMIN"');

-- Client can upload files to own tickets
CREATE POLICY "user_insert_own_ticket_files" ON public.ticket_files
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- ===== REALTIME (ensure it's enabled) =====
-- Safe to re-run; will no-op if already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'ticket_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
  END IF;
END $$;
