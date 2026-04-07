-- =============================================
-- SQL 11: Link brands to vehicle types
-- Enables filtering brands by vehicle type in the ticket wizard
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Add vehicle_type column to vehicle_brands
ALTER TABLE public.vehicle_brands
  ADD COLUMN IF NOT EXISTS vehicle_types TEXT[] DEFAULT ARRAY['car'];

-- 2. Set vehicle types for each brand
-- Cars (default - most brands)
-- No update needed for pure car brands since default is ['car']

-- Truck brands
UPDATE public.vehicle_brands SET vehicle_types = ARRAY['truck']
WHERE name IN ('DAF', 'Iveco', 'Mercedes-Benz Trucks', 'Volvo Trucks', 'Krone');

-- Agriculture / Tractor brands
UPDATE public.vehicle_brands SET vehicle_types = ARRAY['agriculture']
WHERE name IN ('Case', 'Challenger', 'Deutz Fahr', 'Fendt', 'JCB', 'Massey Fergusson', 'McCormick', 'New Holland', 'Steyr');

-- Brands that have BOTH car AND truck
UPDATE public.vehicle_brands SET vehicle_types = ARRAY['car', 'truck']
WHERE name IN ('Ford', 'Renault', 'Fiat', 'Mitsubishi', 'Nissan', 'Toyota', 'Volkswagen', 'Hyundai');

-- Brands that have car AND agriculture (some utility vehicles)
UPDATE public.vehicle_brands SET vehicle_types = ARRAY['car', 'agriculture']
WHERE name IN ('Mahindra');

-- Mercedes-Benz (cars only - trucks have separate brand "Mercedes-Benz Trucks")
-- Already default ['car'], no update needed

-- GMC is trucks + car (SUVs)
UPDATE public.vehicle_brands SET vehicle_types = ARRAY['car', 'truck']
WHERE name = 'GMC';

-- Motorcycle brands (none in current DB, but ready for future)
-- Boat brands (none in current DB, but ready for future)

-- 3. Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_types ON public.vehicle_brands USING GIN (vehicle_types);
