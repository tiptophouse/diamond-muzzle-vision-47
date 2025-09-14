-- Fix security warning: Update function with proper search_path
CREATE OR REPLACE FUNCTION public.use_share_quota(p_user_telegram_id bigint, p_diamond_stock_number text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_shares_remaining integer;
BEGIN
  -- Get current shares remaining
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
$$;