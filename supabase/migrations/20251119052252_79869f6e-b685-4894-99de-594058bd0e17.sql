-- CRITICAL FIX: Update set_user_context to set both context variables
-- This fixes RLS policies that check app.current_user_id

CREATE OR REPLACE FUNCTION public.set_user_context(telegram_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Set BOTH context variables that RLS policies check
  PERFORM set_config('app.current_telegram_id', telegram_id::text, false);
  PERFORM set_config('app.current_user_id', telegram_id::text, false);
  
  -- Log the context being set for debugging
  RAISE NOTICE 'User context set: telegram_id=%, current_user_id=%', telegram_id, current_setting('app.current_user_id', true);
END;
$$;