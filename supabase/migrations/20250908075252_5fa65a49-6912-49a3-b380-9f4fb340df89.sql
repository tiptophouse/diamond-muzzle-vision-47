-- Fix critical data isolation issues by updating RLS policies to use proper JWT authentication

-- First, let's create a secure function to get the current authenticated user's telegram ID from JWT
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

-- Update inventory RLS policies to use JWT properly
DROP POLICY IF EXISTS "Users can access their own inventory" ON public.inventory;
CREATE POLICY "Users can access their own inventory" 
ON public.inventory 
FOR ALL 
USING (user_id = get_current_user_telegram_id())
WITH CHECK (user_id = get_current_user_telegram_id());

-- Fix user_profiles to only allow users to see their own data
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

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

-- Fix keshett_agreements to use JWT properly
DROP POLICY IF EXISTS "Seller can create and manage keshett agreements" ON public.keshett_agreements;
DROP POLICY IF EXISTS "Buyer can view and accept keshett agreements" ON public.keshett_agreements;
DROP POLICY IF EXISTS "Buyer can update keshett agreements status" ON public.keshett_agreements;

CREATE POLICY "Seller can create and manage keshett agreements" 
ON public.keshett_agreements 
FOR ALL 
USING (seller_telegram_id = get_current_user_telegram_id())
WITH CHECK (seller_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Buyer can view and accept keshett agreements" 
ON public.keshett_agreements 
FOR SELECT 
USING (buyer_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Buyer can update keshett agreements status" 
ON public.keshett_agreements 
FOR UPDATE 
USING (buyer_telegram_id = get_current_user_telegram_id())
WITH CHECK (buyer_telegram_id = get_current_user_telegram_id());

-- Fix ring_orders to use JWT properly
DROP POLICY IF EXISTS "Users can view their own ring orders" ON public.ring_orders;
DROP POLICY IF EXISTS "Users can create their own ring orders" ON public.ring_orders;
DROP POLICY IF EXISTS "Users can update their own ring orders" ON public.ring_orders;

CREATE POLICY "Users can view their own ring orders" 
ON public.ring_orders 
FOR SELECT 
USING (customer_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can create their own ring orders" 
ON public.ring_orders 
FOR INSERT 
WITH CHECK (customer_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can update their own ring orders" 
ON public.ring_orders 
FOR UPDATE 
USING (customer_telegram_id = get_current_user_telegram_id())
WITH CHECK (customer_telegram_id = get_current_user_telegram_id());

-- Fix diamond_shares to use JWT properly
DROP POLICY IF EXISTS "Diamond owners can view shares of their diamonds" ON public.diamond_shares;
DROP POLICY IF EXISTS "Users can create diamond shares" ON public.diamond_shares;

CREATE POLICY "Diamond owners can view shares of their diamonds" 
ON public.diamond_shares 
FOR SELECT 
USING (shared_by = get_current_user_telegram_id());

CREATE POLICY "Users can create diamond shares" 
ON public.diamond_shares 
FOR INSERT 
WITH CHECK (shared_by = get_current_user_telegram_id());

-- Fix diamond_share_analytics to use JWT properly
DROP POLICY IF EXISTS "Diamond owners can view analytics for their diamonds" ON public.diamond_share_analytics;

CREATE POLICY "Diamond owners can view analytics for their diamonds" 
ON public.diamond_share_analytics 
FOR SELECT 
USING (owner_telegram_id = get_current_user_telegram_id());

-- Update the admin check functions to be more secure
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_settings 
    WHERE setting_key = 'admin_telegram_id' 
    AND (
      CASE 
        WHEN jsonb_typeof(setting_value) = 'number' THEN setting_value::bigint
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'value' THEN (setting_value->>'value')::bigint
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'admin_telegram_id' THEN (setting_value->>'admin_telegram_id')::bigint
        WHEN jsonb_typeof(setting_value) = 'string' THEN (setting_value#>>'{}')::bigint
        ELSE 2138564172
      END
    ) = get_current_user_telegram_id()
  );
$$;

-- Update admin policies to use the new secure function
DROP POLICY IF EXISTS "Admin users can view all app settings" ON public.app_settings;
CREATE POLICY "Admin users can view all app settings" 
ON public.app_settings 
FOR SELECT 
USING (is_current_user_admin());

-- Ensure analytics tables only show data to admin or own user data
DROP POLICY IF EXISTS "Admins can view all bot usage analytics" ON public.bot_usage_analytics;
CREATE POLICY "Users can view their own bot usage analytics" 
ON public.bot_usage_analytics 
FOR SELECT 
USING (telegram_id = get_current_user_telegram_id() OR is_current_user_admin());