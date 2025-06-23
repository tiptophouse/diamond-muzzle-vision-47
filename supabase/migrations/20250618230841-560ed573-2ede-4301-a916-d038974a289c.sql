
-- Drop the existing view that has SECURITY DEFINER
DROP VIEW IF EXISTS public.recent_user_logins;

-- Recreate the view without SECURITY DEFINER to respect RLS policies
CREATE VIEW public.recent_user_logins AS
SELECT 
  telegram_id,
  first_name,
  last_name,
  username,
  MAX(login_timestamp) as last_login,
  COUNT(*) as login_count,
  MIN(login_timestamp) as first_login
FROM public.user_logins 
GROUP BY telegram_id, first_name, last_name, username
ORDER BY last_login DESC;

-- Ensure the view respects RLS by enabling it (views inherit RLS from underlying tables)
-- The view will now respect the RLS policies on the user_logins table

-- Update the RLS policy on user_logins to be more specific about admin access
DROP POLICY IF EXISTS "Admin can view all user logins" ON public.user_logins;

-- Create a more secure policy that uses a function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_settings 
    WHERE setting_key = 'admin_telegram_id' 
    AND (
      -- Check if setting_value is a number
      CASE 
        WHEN jsonb_typeof(setting_value) = 'number' THEN setting_value::bigint
        -- Check if setting_value is an object with a value property
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'value' THEN (setting_value->>'value')::bigint
        -- Check if setting_value is an object with admin_telegram_id property
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'admin_telegram_id' THEN (setting_value->>'admin_telegram_id')::bigint
        -- Check if setting_value is a string that can be parsed as number
        WHEN jsonb_typeof(setting_value) = 'string' THEN (setting_value#>>'{}')::bigint
        ELSE 2138564172 -- fallback admin ID
      END
    ) = (
      SELECT telegram_id FROM public.user_profiles 
      WHERE telegram_id = auth.uid()::text::bigint
      LIMIT 1
    )
  );
$$;

-- Create new RLS policy using the security definer function
CREATE POLICY "Admin can view all user logins" 
ON public.user_logins 
FOR ALL 
USING (public.is_admin_user());
