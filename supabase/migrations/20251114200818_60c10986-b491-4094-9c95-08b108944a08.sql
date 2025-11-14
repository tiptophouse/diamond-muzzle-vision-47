-- Create function to set user context for RLS
CREATE OR REPLACE FUNCTION public.set_user_context(telegram_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Set the telegram_id in the session context for RLS policies to use
  PERFORM set_config('app.current_telegram_id', telegram_id::text, false);
END;
$$;

COMMENT ON FUNCTION public.set_user_context(BIGINT) IS 'Sets the current user telegram_id in session context for RLS policies';
