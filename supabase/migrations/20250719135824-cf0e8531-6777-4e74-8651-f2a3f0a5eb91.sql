-- Fix RLS policy for user_logins table to allow all authenticated users to insert
DROP POLICY IF EXISTS "Admin can view all user logins" ON public.user_logins;

CREATE POLICY "Allow all to insert user logins" 
ON public.user_logins 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can view all user logins" 
ON public.user_logins 
FOR SELECT 
USING (is_admin_user());