
-- Fix the security warning by setting a fixed search_path for the get_user_statistics function
ALTER FUNCTION public.get_user_statistics() SET search_path = '';

-- Also fix the update_updated_at_column function to have a fixed search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
