-- Seed departments, workers, settings.
-- Auth users cannot be inserted from SQL without the service role.
-- Create them in Authentication > Users (or the demo SPA, which ships its own seed):
--
--   priya@meridian.edu       / demo1234   (student)
--   admin@meridian.edu       / demo1234   (admin)       — set profiles.role = 'admin'
--   director@meridian.edu    / demo1234   (super_admin) — set profiles.role = 'super_admin'
--
-- After creating those users, run the UPDATE statements at the bottom.

insert into public.departments (id, name, categories) values
  ('11111111-1111-1111-1111-111111111001', 'Maintenance', '{water,furniture,infrastructure}'),
  ('11111111-1111-1111-1111-111111111002', 'IT Services', '{wifi,classroom}'),
  ('11111111-1111-1111-1111-111111111003', 'Electrical', '{electricity}'),
  ('11111111-1111-1111-1111-111111111004', 'Housekeeping', '{washroom}'),
  ('11111111-1111-1111-1111-111111111005', 'Mess & Canteen', '{food_hygiene}'),
  ('11111111-1111-1111-1111-111111111006', 'Security', '{security}'),
  ('11111111-1111-1111-1111-111111111007', 'Estate Office', '{infrastructure,other}')
on conflict (id) do nothing;

insert into public.workers (department_id, name, phone, specialties, is_active) values
  ('11111111-1111-1111-1111-111111111001', 'Ramesh Kumar', '98XXXX1101', '{water,infrastructure}', true),
  ('11111111-1111-1111-1111-111111111002', 'Suresh Nair', '98XXXX1102', '{wifi,classroom}', true),
  ('11111111-1111-1111-1111-111111111004', 'Lakshmi Devi', '98XXXX1103', '{washroom}', true),
  ('11111111-1111-1111-1111-111111111003', 'Vijay Sharma', '98XXXX1104', '{electricity}', true),
  ('11111111-1111-1111-1111-111111111005', 'Chef Raman', '98XXXX1105', '{food_hygiene}', true),
  ('11111111-1111-1111-1111-111111111006', 'Farhan Qureshi', '98XXXX1106', '{security}', true);

update public.app_settings set
  campus_name = 'Meridian Institute of Technology',
  campus_center_lat = 28.545,
  campus_center_lng = 77.193
where id = 1;

-- After creating auth users, promote the admin accounts:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'admin@meridian.edu');
-- update public.profiles set role = 'super_admin' where id = (select id from auth.users where email = 'director@meridian.edu');
--
-- Sample complaints: the SPA demo store already includes ~32 realistic reports
-- spread across the campus map. To load them into Postgres, use the in-app
-- "Restore demo data" as a reference and insert via a script with the service
-- role, or operate the demo locally without Supabase (default).
