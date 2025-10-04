-- Fix circular dependency in admin role checking
-- This allows the admin check to work from the Telegram environment

-- 1. Drop existing policies that cause circular dependency
DROP POLICY IF EXISTS "Admins can view admin roles via function" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles via function" ON admin_roles;

-- 2. Update check_is_admin_role to use SECURITY DEFINER with explicit search_path
CREATE OR REPLACE FUNCTION check_is_admin_role(check_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE telegram_id = check_telegram_id 
    AND is_active = true
  );
$$;

-- 3. Create new policies that allow the function to work
-- Allow anyone to check if a telegram_id is admin (read-only, safe)
CREATE POLICY "Anyone can check admin status"
ON admin_roles
FOR SELECT
USING (true);

-- Only super admins can modify admin roles
CREATE POLICY "Super admins can manage admin roles"
ON admin_roles
FOR ALL
USING (check_is_super_admin(COALESCE((current_setting('app.current_telegram_id', true))::bigint, 0)))
WITH CHECK (check_is_super_admin(COALESCE((current_setting('app.current_telegram_id', true))::bigint, 0)));

-- 4. Ensure check_is_super_admin also has SECURITY DEFINER
CREATE OR REPLACE FUNCTION check_is_super_admin(check_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE telegram_id = check_telegram_id 
    AND role = 'super_admin'
    AND is_active = true
  );
$$;