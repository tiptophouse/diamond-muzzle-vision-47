-- Fix security vulnerability: Restrict clients table access to admins only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.clients;

-- Create secure policies that only allow admin access
CREATE POLICY "Admins can view all clients" 
ON public.clients 
FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "Admins can insert clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update clients" 
ON public.clients 
FOR UPDATE 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete clients" 
ON public.clients 
FOR DELETE 
USING (is_current_user_admin());