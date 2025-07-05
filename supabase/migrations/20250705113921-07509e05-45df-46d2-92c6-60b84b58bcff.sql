-- Fix infinite recursion in app_settings RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can view all app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin users can insert app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin users can update app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin users can delete app settings" ON public.app_settings;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_settings 
    WHERE setting_key = 'admin_telegram_id' 
    AND (
      CASE 
        WHEN jsonb_typeof(setting_value) = 'number' THEN setting_value::bigint
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'value' THEN (setting_value->>'value')::bigint
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'admin_telegram_id' THEN (setting_value->>'admin_telegram_id')::bigint
        WHEN jsonb_typeof(setting_value) = 'string' THEN (setting_value#>>'{}')::bigint
        ELSE 2138564172
      END
    ) = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  );
$$;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admin users can view all app settings" 
ON public.app_settings 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admin users can insert app settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admin users can update app settings" 
ON public.app_settings 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Admin users can delete app settings" 
ON public.app_settings 
FOR DELETE 
USING (public.is_current_user_admin());

-- Fix user_behavior_analytics RLS policy
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_behavior_analytics;

CREATE POLICY "Users can insert their own analytics" 
ON public.user_behavior_analytics 
FOR INSERT 
WITH CHECK (
  telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  OR public.is_current_user_admin()
);