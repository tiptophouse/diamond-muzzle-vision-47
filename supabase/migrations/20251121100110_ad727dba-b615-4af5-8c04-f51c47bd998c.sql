-- Add new admin with Telegram ID 7397516151
INSERT INTO public.admin_roles (telegram_id, role, is_active)
VALUES (7397516151, 'admin', true)
ON CONFLICT (telegram_id) 
DO UPDATE SET 
  is_active = true,
  updated_at = now();