-- =============================================
-- EUROFILES - BLOCO 3: SERVIÇOS + PACOTES + STORAGE
-- Rode depois do 02-security.sql
-- =============================================

INSERT INTO services (name, slug, description, price_credits, category, sort_order) VALUES
  ('Stage 1 Remap', 'stage-1', 'Individual changes for fuel injection, boost pressure, rail pressure, turbine geometry and limiting maps.', 50, 'tuning', 1),
  ('Stage 2 Remap', 'stage-2', 'For modified engines with hybrid turbochargers, bigger injectors, modified fuel pumps.', 75, 'tuning', 2),
  ('Stage 3 Remap', 'stage-3', 'For highly modified engines with full turbo upgrade, custom exhaust and fueling.', 100, 'tuning', 3),
  ('DPF/FAP Removal', 'dpf-off', 'Disable DPF regeneration without causing error codes or limp mode after filter removal.', 30, 'removal', 4),
  ('EGR Removal', 'egr-off', 'Switch off EGR valve with optimized solutions. Better efficiency and fuel economy.', 25, 'removal', 5),
  ('DTC Removal', 'dtc-off', 'Remove any diagnostic trouble code from the ECU causing problems.', 20, 'removal', 6),
  ('AdBlue/SCR Removal', 'adblue-off', 'Disable AdBlue system completely without data trouble codes or safe mode.', 35, 'removal', 7),
  ('Lambda/O2 Removal', 'lambda-off', 'Remove lambda/O2 sensor for decat exhaust setups.', 25, 'removal', 8),
  ('Speed Limiter Removal', 'vmax-off', 'Remove factory speed limiter / VMAX restriction.', 20, 'removal', 9),
  ('Pops & Bangs', 'pops-bangs', 'Make your exhaust sound better with pop and bangs, crackles and overruns.', 40, 'feature', 10),
  ('Launch Control', 'launch-control', 'Launch from 0km/h as fast as possible with power limiting.', 40, 'feature', 11),
  ('Start-Stop OFF', 'start-stop-off', 'Disable automatic start-stop system permanently.', 15, 'removal', 12),
  ('IMMO OFF', 'immo-off', 'Disable immobilizer for ECU swap or key issues.', 30, 'removal', 13),
  ('Flap/Swirl Removal', 'flap-off', 'Disable intake flap/swirl valve without error codes.', 20, 'removal', 14),
  ('Hot Start Fix', 'hot-start', 'Fix hot start issues on diesel engines.', 25, 'other', 15),
  ('GPF/OPF Removal', 'gpf-off', 'Disable gasoline particulate filter.', 30, 'removal', 16),
  ('Torque Limiter OFF', 'torque-off', 'Remove factory torque limiters for maximum performance.', 25, 'feature', 17),
  ('Cold Start Noise OFF', 'cold-start', 'Remove cold start increased idle/noise.', 15, 'feature', 18),
  ('Rev Limiter Increase', 'rev-limit', 'Increase the factory rev limiter.', 20, 'feature', 19),
  ('Exhaust Flap Always Open', 'exhaust-flap', 'Keep exhaust valve open permanently for sound.', 15, 'feature', 20),
  ('NOx Sensor OFF', 'nox-off', 'Disable NOx sensor monitoring.', 20, 'removal', 21),
  ('Hardcut Limiter', 'hardcut', 'Add a hardcut rev limiter for dramatic effect.', 30, 'feature', 22),
  ('Decat', 'decat', 'Catalytic converter removal software solution.', 25, 'removal', 23),
  ('TVA/Throttle Removal', 'tva-off', 'Disable electronic throttle valve actuator.', 20, 'removal', 24),
  ('Custom Request', 'custom', 'Any special ECU tuning request not listed above.', 0, 'other', 25);

INSERT INTO credit_packages (name, credits, price_eur, bonus_credits, is_popular, sort_order) VALUES
  ('Starter', 25, 25.00, 0, FALSE, 1),
  ('Basic', 50, 45.00, 5, FALSE, 2),
  ('Standard', 100, 85.00, 15, TRUE, 3),
  ('Professional', 200, 160.00, 40, FALSE, 4),
  ('Enterprise', 500, 375.00, 125, FALSE, 5);

INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-files', 'ticket-files', FALSE);

CREATE POLICY "Users upload to own folder" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ticket-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own files" ON storage.objects FOR SELECT
  USING (bucket_id = 'ticket-files' AND auth.uid()::text = (storage.foldername(name))[1]);
