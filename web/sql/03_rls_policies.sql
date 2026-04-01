-- =============================================
-- SQL 03: RLS Policies (seguranca)
-- Rodar TERCEIRO no SQL Editor do Supabase
-- =============================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ===== PROFILES =====
-- Admin ve todos os perfis
CREATE POLICY "admin_read_all_profiles" ON public.profiles
  FOR SELECT USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Cliente ve apenas o proprio perfil
CREATE POLICY "user_read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Cliente atualiza apenas o proprio perfil
CREATE POLICY "user_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin atualiza qualquer perfil
CREATE POLICY "admin_update_all_profiles" ON public.profiles
  FOR UPDATE USING (get_my_claim('userrole')::text = '"ADMIN"');

-- ===== PRODUCTS =====
-- Qualquer logado pode ver produtos ativos
CREATE POLICY "anyone_read_active_products" ON public.products
  FOR SELECT USING (is_active = true);

-- Admin ve todos (inclusive inativos)
CREATE POLICY "admin_read_all_products" ON public.products
  FOR SELECT USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Admin CRUD completo em produtos
CREATE POLICY "admin_insert_products" ON public.products
  FOR INSERT WITH CHECK (get_my_claim('userrole')::text = '"ADMIN"');

CREATE POLICY "admin_update_products" ON public.products
  FOR UPDATE USING (get_my_claim('userrole')::text = '"ADMIN"');

CREATE POLICY "admin_delete_products" ON public.products
  FOR DELETE USING (get_my_claim('userrole')::text = '"ADMIN"');

-- ===== ORDERS =====
-- Admin ve todos os pedidos
CREATE POLICY "admin_read_all_orders" ON public.orders
  FOR SELECT USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Cliente ve apenas seus proprios pedidos
CREATE POLICY "user_read_own_orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Cliente cria pedido (apenas no proprio nome)
CREATE POLICY "user_insert_own_orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin atualiza qualquer pedido
CREATE POLICY "admin_update_all_orders" ON public.orders
  FOR UPDATE USING (get_my_claim('userrole')::text = '"ADMIN"');

-- ===== ORDER ITEMS =====
-- Admin ve todos
CREATE POLICY "admin_read_all_order_items" ON public.order_items
  FOR SELECT USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Cliente ve itens dos proprios pedidos
CREATE POLICY "user_read_own_order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admin insere itens
CREATE POLICY "admin_insert_order_items" ON public.order_items
  FOR INSERT WITH CHECK (get_my_claim('userrole')::text = '"ADMIN"');

-- ===== CONTACTS =====
-- Qualquer pessoa pode enviar contato (sem autenticacao)
CREATE POLICY "anyone_insert_contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

-- Admin ve todos os contatos
CREATE POLICY "admin_read_all_contacts" ON public.contacts
  FOR SELECT USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Admin atualiza contatos (marcar como lido)
CREATE POLICY "admin_update_contacts" ON public.contacts
  FOR UPDATE USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Admin deleta contatos
CREATE POLICY "admin_delete_contacts" ON public.contacts
  FOR DELETE USING (get_my_claim('userrole')::text = '"ADMIN"');
