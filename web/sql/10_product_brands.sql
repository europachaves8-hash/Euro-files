-- =============================================
-- SQL 10: Product-Brand relationship table
-- Links products/services to vehicle brands
-- If no brands linked, service applies to ALL vehicles
-- Run in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS public.product_brands (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES public.vehicle_brands(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, brand_id)
);

ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "admin_manage_product_brands" ON public.product_brands
  FOR ALL USING (get_my_claim('userrole')::text = '"ADMIN"');

-- Anyone can read (needed for wizard filtering)
CREATE POLICY "anyone_read_product_brands" ON public.product_brands
  FOR SELECT USING (true);
