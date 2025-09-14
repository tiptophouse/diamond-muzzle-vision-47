-- Update use_share_quota function to bypass quota for admin users
CREATE OR REPLACE FUNCTION public.use_share_quota(p_user_telegram_id bigint, p_diamond_stock_number text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_shares_remaining integer;
  v_is_admin boolean;
BEGIN
  -- Check if user is admin first
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
    ) = p_user_telegram_id
  ) INTO v_is_admin;
  
  -- If user is admin, always return true without using quota
  IF v_is_admin THEN
    -- Still record share history for analytics
    INSERT INTO user_share_history (
      user_telegram_id, 
      diamond_stock_number, 
      shares_remaining_after,
      analytics_data
    ) VALUES (
      p_user_telegram_id, 
      p_diamond_stock_number,
      999, -- Admin has unlimited shares
      jsonb_build_object('timestamp', now(), 'action', 'group_share', 'admin_bypass', true)
    );
    
    RETURN TRUE;
  END IF;
  
  -- Get current shares remaining for non-admin users
  SELECT shares_remaining INTO v_shares_remaining
  FROM user_profiles
  WHERE telegram_id = p_user_telegram_id;
  
  -- Check if user has shares remaining
  IF v_shares_remaining IS NULL OR v_shares_remaining <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Decrement shares
  UPDATE user_profiles
  SET shares_remaining = shares_remaining - 1,
      updated_at = now()
  WHERE telegram_id = p_user_telegram_id;
  
  -- Update or insert quota tracking
  INSERT INTO user_share_quotas (user_telegram_id, shares_used, shares_granted)
  VALUES (p_user_telegram_id, 1, 5)
  ON CONFLICT (user_telegram_id) DO UPDATE SET
    shares_used = user_share_quotas.shares_used + 1,
    updated_at = now();
  
  -- Record share history
  INSERT INTO user_share_history (
    user_telegram_id, 
    diamond_stock_number, 
    shares_remaining_after,
    analytics_data
  ) VALUES (
    p_user_telegram_id, 
    p_diamond_stock_number,
    v_shares_remaining - 1,
    jsonb_build_object('timestamp', now(), 'action', 'group_share')
  );
  
  RETURN TRUE;
END;
$function$;