-- PHASE 1: EMERGENCY DATA LOCKDOWN - Fix Critical RLS Vulnerabilities

-- 1. SECURE USER PROFILES - Users can only view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow telegram users to upsert their profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;

CREATE POLICY "Users can view own profile only" ON public.user_profiles
FOR SELECT USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can update own profile only" ON public.user_profiles  
FOR UPDATE USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can insert own profile only" ON public.user_profiles
FOR INSERT WITH CHECK (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Admin can manage all profiles" ON public.user_profiles
FOR ALL USING (is_current_user_admin());

-- 2. SECURE USER LOGINS - Admin only access
DROP POLICY IF EXISTS "Anyone can view user logins" ON public.user_logins;
DROP POLICY IF EXISTS "Allow read access to user logins" ON public.user_logins;

CREATE POLICY "Admin only access to user logins" ON public.user_logins
FOR ALL USING (is_current_user_admin());

-- 3. SECURE CHAT MESSAGES - User-specific only
DROP POLICY IF EXISTS "Allow telegram users to create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow telegram users to read their messages" ON public.chat_messages;  
DROP POLICY IF EXISTS "Allow telegram users to delete their messages" ON public.chat_messages;

CREATE POLICY "Users can create own messages" ON public.chat_messages
FOR INSERT WITH CHECK (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can view own messages" ON public.chat_messages
FOR SELECT USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can delete own messages" ON public.chat_messages  
FOR DELETE USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- 4. SECURE ANALYTICS EVENTS - User-specific access
DROP POLICY IF EXISTS "Allow all operations for analytics_events" ON public.analytics_events;

CREATE POLICY "Users can create own analytics" ON public.analytics_events
FOR INSERT WITH CHECK (true); -- Allow creation for tracking

CREATE POLICY "Users can view own analytics" ON public.analytics_events  
FOR SELECT USING (session_id IN (
  SELECT session_id FROM public.user_sessions 
  WHERE telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
));

CREATE POLICY "Admin can view all analytics" ON public.analytics_events
FOR SELECT USING (is_current_user_admin());

-- 5. SECURE PAGE VISITS - User-specific access  
DROP POLICY IF EXISTS "Admin can view all page visits" ON public.page_visits;

CREATE POLICY "Users can create page visits" ON public.page_visits
FOR INSERT WITH CHECK (true); -- Allow creation for tracking

CREATE POLICY "Users can view own page visits" ON public.page_visits
FOR SELECT USING (session_id IN (
  SELECT session_id FROM public.user_sessions 
  WHERE telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
));

CREATE POLICY "Admin can view all page visits" ON public.page_visits  
FOR ALL USING (is_current_user_admin());

-- 6. SECURE USER BEHAVIOR ANALYTICS - Self access only
CREATE POLICY "Users can view own behavior analytics" ON public.user_behavior_analytics
FOR SELECT USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can update own behavior analytics" ON public.user_behavior_analytics
FOR UPDATE USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Admin can view all behavior analytics" ON public.user_behavior_analytics
FOR ALL USING (is_current_user_admin());

-- 7. SECURE USER ANALYTICS - Self access only  
CREATE POLICY "Users can view own analytics" ON public.user_analytics
FOR SELECT USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can update own analytics" ON public.user_analytics
FOR UPDATE USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Admin can view all user analytics" ON public.user_analytics
FOR ALL USING (is_current_user_admin());

-- 8. CREATE SECURE ADMIN VERIFICATION FUNCTION
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
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
    ) = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  );
$$;

-- 9. SECURE DIAMOND DELETION FUNCTION 
CREATE OR REPLACE FUNCTION public.delete_diamond_secure(p_stock_number text, p_user_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_deleted BOOLEAN;
BEGIN
  -- Verify user authorization
  IF p_user_id != COALESCE((current_setting('app.current_user_id', true))::bigint, 0) THEN
    RAISE EXCEPTION 'Unauthorized: User can only delete own diamonds';
  END IF;

  DELETE FROM public.inventory
  WHERE stock_number = p_stock_number
  AND user_id = p_user_id
  AND deleted_at IS NULL;
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  -- Log the deletion for audit
  INSERT INTO public.user_activity_log (telegram_id, activity_type, activity_data)
  VALUES (p_user_id, 'diamond_deleted', jsonb_build_object('stock_number', p_stock_number, 'success', v_deleted));
  
  RETURN v_deleted > 0;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO public.user_activity_log (telegram_id, activity_type, activity_data)
    VALUES (p_user_id, 'diamond_delete_error', jsonb_build_object('stock_number', p_stock_number, 'error', SQLERRM));
    RAISE;
END;
$$;

-- 10. SECURE DIAMOND ADDITION FUNCTION
CREATE OR REPLACE FUNCTION public.add_diamond_secure(
  p_user_id bigint, 
  p_stock_number text, 
  p_shape text, 
  p_weight numeric, 
  p_color text, 
  p_clarity text, 
  p_cut text, 
  p_polish text, 
  p_symmetry text, 
  p_price_per_carat numeric, 
  p_status text, 
  p_picture text, 
  p_certificate_url text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verify user authorization
  IF p_user_id != COALESCE((current_setting('app.current_user_id', true))::bigint, 0) THEN
    RAISE EXCEPTION 'Unauthorized: User can only add own diamonds';
  END IF;

  -- Input validation
  IF p_stock_number IS NULL OR p_stock_number = '' THEN
    RAISE EXCEPTION 'Stock number is required';
  END IF;
  
  IF p_weight <= 0 THEN
    RAISE EXCEPTION 'Weight must be positive';
  END IF;

  INSERT INTO public.inventory (
    user_id, stock_number, shape, weight, color, clarity, cut, polish, symmetry,
    price_per_carat, status, picture, certificate_url, created_at, updated_at
  ) VALUES (
    p_user_id, p_stock_number, p_shape, p_weight, p_color, p_clarity, p_cut, 
    p_polish, p_symmetry, p_price_per_carat, p_status, p_picture, p_certificate_url,
    NOW(), NOW()
  );
  
  -- Log the addition for audit
  INSERT INTO public.user_activity_log (telegram_id, activity_type, activity_data)
  VALUES (p_user_id, 'diamond_added', jsonb_build_object('stock_number', p_stock_number, 'success', true));
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error  
    INSERT INTO public.user_activity_log (telegram_id, activity_type, activity_data)
    VALUES (p_user_id, 'diamond_add_error', jsonb_build_object('stock_number', p_stock_number, 'error', SQLERRM));
    RAISE;
END;
$$;