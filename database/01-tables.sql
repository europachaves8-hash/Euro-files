-- =============================================
-- EUROFILES - BLOCO 1: TABELAS + TRIGGERS
-- Rode este primeiro
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  country TEXT,
  phone TEXT,
  credits DECIMAL(10,2) DEFAULT 0.00,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE vehicle_brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_models (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

CREATE TABLE vehicle_engines (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric', 'other')),
  displacement TEXT,
  power_hp INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  price_credits DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'tuning' CHECK (category IN ('tuning', 'removal', 'feature', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES vehicle_brands(id),
  model_id INTEGER REFERENCES vehicle_models(id),
  engine_id INTEGER REFERENCES vehicle_engines(id),
  vehicle_info TEXT,
  ecu_type TEXT,
  ecu_software TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  notes TEXT,
  total_credits DECIMAL(10,2) DEFAULT 0,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'EF-' || LPAD(NEW.id::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

CREATE TABLE ticket_services (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price_credits DECIMAL(10,2) NOT NULL,
  UNIQUE(ticket_id, service_id)
);

CREATE TABLE ticket_files (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT CHECK (file_type IN ('original', 'modified', 'attachment')),
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'debit', 'refund', 'bonus')),
  description TEXT,
  payment_method TEXT,
  payment_id TEXT,
  ticket_id INTEGER REFERENCES tickets(id),
  balance_after DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  credits DECIMAL(10,2) NOT NULL,
  price_eur DECIMAL(10,2) NOT NULL,
  bonus_credits DECIMAL(10,2) DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id INTEGER REFERENCES credit_transactions(id),
  amount_eur DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_eur DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'cancelled')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEW.id::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();
