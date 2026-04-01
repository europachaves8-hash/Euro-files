-- =============================================
-- SQL 04: Seed de produtos (servicos de tuning)
-- Rodar QUARTO no SQL Editor do Supabase
-- =============================================

INSERT INTO public.products (name, description, price_credits, category) VALUES
  ('Stage 1 Remap', 'Optimized ECU remap for improved power and torque', 150.00, 'remap'),
  ('Stage 2 Remap', 'Advanced remap requiring hardware modifications', 200.00, 'remap'),
  ('DPF / FAP OFF', 'Diesel particulate filter removal from ECU', 80.00, 'solution'),
  ('EGR OFF', 'Exhaust gas recirculation delete', 60.00, 'solution'),
  ('DTC OFF', 'Diagnostic trouble code removal', 50.00, 'solution'),
  ('AdBlue / SCR OFF', 'AdBlue system deactivation', 80.00, 'solution'),
  ('Lambda / O2 OFF', 'Oxygen sensor deactivation for decat', 60.00, 'solution'),
  ('GPF / OPF OFF', 'Gasoline particulate filter removal', 80.00, 'solution'),
  ('Speed Limiter OFF', 'VMAX speed limiter removal', 50.00, 'solution'),
  ('Pop And Bangs', 'Crackle map / overrun pops', 100.00, 'feature'),
  ('Launch Control', 'Launch control activation', 80.00, 'feature'),
  ('Start-Stop OFF', 'Auto start-stop system deactivation', 40.00, 'feature'),
  ('IMMO OFF', 'Immobilizer deactivation', 120.00, 'solution'),
  ('E85 Flexfuel', 'Ethanol E85 fuel map conversion', 180.00, 'remap');
