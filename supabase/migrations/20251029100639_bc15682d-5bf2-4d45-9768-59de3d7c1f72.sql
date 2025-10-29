-- Fix remaining security warnings for functions without search_path

-- Fix: set_admin_session_context function
CREATE OR REPLACE FUNCTION public.set_admin_session_context(telegram_id_param bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only set context if user is actually an admin
  IF public.is_admin(telegram_id_param) THEN
    PERFORM set_config('app.current_telegram_id', telegram_id_param::text, true);
  ELSE
    RAISE EXCEPTION 'Unauthorized: Not an admin user';
  END IF;
END;
$function$;

-- Fix: update_diamond_offers_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_diamond_offers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;