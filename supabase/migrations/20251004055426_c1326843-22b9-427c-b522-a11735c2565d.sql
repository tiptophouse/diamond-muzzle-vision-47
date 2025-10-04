-- Fix infinite recursion in admin_roles RLS policies
-- The issue: policies query the same table they protect, causing infinite loop

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;

-- Create security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.check_is_admin_role(check_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE telegram_id = check_telegram_id 
    AND is_active = true
  );
$$;

-- Create security definer function to check super admin role
CREATE OR REPLACE FUNCTION public.check_is_super_admin(check_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE telegram_id = check_telegram_id 
    AND role = 'super_admin'
    AND is_active = true
  );
$$;

-- Create new RLS policies using security definer functions (no recursion)
CREATE POLICY "Admins can view admin roles via function"
ON public.admin_roles
FOR SELECT
USING (
  public.check_is_admin_role(
    COALESCE((current_setting('app.current_telegram_id', true))::bigint, 0)
  )
);

CREATE POLICY "Super admins can manage admin roles via function"
ON public.admin_roles
FOR ALL
USING (
  public.check_is_super_admin(
    COALESCE((current_setting('app.current_telegram_id', true))::bigint, 0)
  )
)
WITH CHECK (
  public.check_is_super_admin(
    COALESCE((current_setting('app.current_telegram_id', true))::bigint, 0)
  )
);

-- Add helpful comments
COMMENT ON FUNCTION public.check_is_admin_role IS 'Security definer function to check admin status without RLS recursion';
COMMENT ON FUNCTION public.check_is_super_admin IS 'Security definer function to check super admin status without RLS recursion';