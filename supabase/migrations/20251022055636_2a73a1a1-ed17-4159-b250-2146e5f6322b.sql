-- Fix RLS policies for blocked_users to allow admin management and users to view their own block status

-- 1) Drop legacy hardcoded-ID policies
DROP POLICY IF EXISTS "Admins can create blocked user records" ON public.blocked_users;
DROP POLICY IF EXISTS "Admins can delete blocked user records" ON public.blocked_users;
DROP POLICY IF EXISTS "Admins can update blocked user records" ON public.blocked_users;
DROP POLICY IF EXISTS "Admins can view all blocked users" ON public.blocked_users;

-- 2) Create admin policies using centralized admin check
CREATE POLICY "Admins can view all blocked users"
ON public.blocked_users
FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Admins can insert blocked users"
ON public.blocked_users
FOR INSERT
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update blocked users"
ON public.blocked_users
FOR UPDATE
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete blocked users"
ON public.blocked_users
FOR DELETE
USING (is_current_user_admin());

-- 3) Allow any user to read whether they are blocked (needed for guards)
CREATE POLICY "Users can view their own block status"
ON public.blocked_users
FOR SELECT
USING (
  telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
);
