
-- Drop the existing view that may have SECURITY DEFINER
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

-- The view will now inherit RLS policies from the underlying user_logins table
-- This ensures only admins can access the data through the existing RLS policy
