-- Fix security issues detected by Supabase security advisor
-- Set fixed search_path for all functions to prevent search path injection attacks

-- Fix set_session_context function
ALTER FUNCTION public.set_session_context(text, text) SET search_path = '';

-- Fix get_realistic_analytics_summary function  
ALTER FUNCTION public.get_realistic_analytics_summary() SET search_path = '';

-- Fix update_user_analytics_on_session_end function
ALTER FUNCTION public.update_user_analytics_on_session_end() SET search_path = '';

-- Fix clean_expired_cache function
ALTER FUNCTION public.clean_expired_cache() SET search_path = '';

-- Fix is_admin_user function
ALTER FUNCTION public.is_admin_user() SET search_path = '';

-- Fix update_updated_at_column function (ensuring consistency)
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Fix update_user_behavior_analytics function
ALTER FUNCTION public.update_user_behavior_analytics() SET search_path = '';

-- Fix other functions that might have been missed
ALTER FUNCTION public.add_diamond_for_user(bigint, text, text, numeric, text, text, text, text, text, numeric, text, text, text) SET search_path = '';
ALTER FUNCTION public.update_diamond_for_user(bigint, text, jsonb) SET search_path = '';
ALTER FUNCTION public.delete_diamond(text, bigint) SET search_path = '';
ALTER FUNCTION public.delete_diamond_by_stock(text, bigint) SET search_path = '';
ALTER FUNCTION public.get_user_statistics() SET search_path = '';
ALTER FUNCTION public.is_current_user_admin() SET search_path = '';