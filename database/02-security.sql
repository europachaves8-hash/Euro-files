-- =============================================
-- EUROFILES - BLOCO 2: RLS + INDEXES
-- Rode depois do 01-tables.sql
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read vehicle_brands" ON vehicle_brands FOR SELECT USING (true);
CREATE POLICY "Public read vehicle_models" ON vehicle_models FOR SELECT USING (true);
CREATE POLICY "Public read vehicle_engines" ON vehicle_engines FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read credit_packages" ON credit_packages FOR SELECT USING (true);

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users read own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tickets" ON tickets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own ticket_services" ON ticket_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_services.ticket_id AND tickets.user_id = auth.uid()));

CREATE POLICY "Users read own ticket_files" ON ticket_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_files.ticket_id AND tickets.user_id = auth.uid()));
CREATE POLICY "Users upload to own tickets" ON ticket_files FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_files.ticket_id AND tickets.user_id = auth.uid()));

CREATE POLICY "Users read own ticket_messages" ON ticket_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_messages.ticket_id AND tickets.user_id = auth.uid()));
CREATE POLICY "Users create messages on own tickets" ON ticket_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_messages.ticket_id AND tickets.user_id = auth.uid()));

CREATE POLICY "Users read own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_vehicle_models_brand ON vehicle_models(brand_id);
CREATE INDEX idx_vehicle_engines_model ON vehicle_engines(model_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_ticket_files_ticket ON ticket_files(ticket_id);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_invoices_user ON invoices(user_id);
