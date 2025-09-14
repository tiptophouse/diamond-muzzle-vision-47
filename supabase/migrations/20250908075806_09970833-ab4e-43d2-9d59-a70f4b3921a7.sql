-- Fix data isolation issues by properly updating all RLS policies

-- First, ensure we have the secure JWT function
CREATE OR REPLACE FUNCTION public.get_current_user_telegram_id()
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint,
    0
  );
$$;

-- Fix user_profiles table - drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create proper user_profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (telegram_id = get_current_user_telegram_id())
WITH CHECK (telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (telegram_id = get_current_user_telegram_id());

-- Fix user_behavior_analytics RLS violations
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_behavior_analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_behavior_analytics;

CREATE POLICY "Users can view their own analytics" 
ON public.user_behavior_analytics 
FOR SELECT 
USING (telegram_id = get_current_user_telegram_id() OR is_current_user_admin());

CREATE POLICY "Users can insert their own analytics" 
ON public.user_behavior_analytics 
FOR INSERT 
WITH CHECK (telegram_id = get_current_user_telegram_id());

-- Fix store_item_views to use proper JWT context  
DROP POLICY IF EXISTS "Share owners can view analytics" ON public.store_item_views;

CREATE POLICY "Share owners can view analytics" 
ON public.store_item_views 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM store_item_shares 
  WHERE store_item_shares.id = store_item_views.share_id 
  AND store_item_shares.owner_telegram_id = get_current_user_telegram_id()
));

-- Update session context function to be more secure
CREATE OR REPLACE FUNCTION public.set_session_context(key text, value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow setting telegram_id from JWT
  IF key = 'app.current_user_id' THEN
    PERFORM set_config(key, get_current_user_telegram_id()::text, false);
  ELSE
    PERFORM set_config(key, value, false);
  END IF;
END;
$$;