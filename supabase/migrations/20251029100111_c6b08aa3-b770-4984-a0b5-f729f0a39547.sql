-- Fix security warnings: Add search_path to security definer functions

-- Fix 1: is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(telegram_id_param bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE telegram_id = telegram_id_param 
    AND is_active = true
  );
END;
$function$;

-- Fix 2: check_is_super_admin function
CREATE OR REPLACE FUNCTION public.check_is_super_admin(check_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE telegram_id = check_telegram_id 
    AND role = 'super_admin'
    AND is_active = true
  );
$function$;

-- Fix 3: check_is_admin_role function
CREATE OR REPLACE FUNCTION public.check_is_admin_role(check_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE telegram_id = check_telegram_id 
    AND is_active = true
  );
$function$;

-- Fix 4: is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;