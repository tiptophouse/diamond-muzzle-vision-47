-- Add shares_remaining column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS shares_remaining integer DEFAULT 5 NOT NULL;

-- Create user_share_quotas table to track share usage and history
CREATE TABLE IF NOT EXISTS public.user_share_quotas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_telegram_id bigint NOT NULL,
    shares_used integer DEFAULT 0 NOT NULL,
    shares_granted integer DEFAULT 5 NOT NULL,
    quota_reset_at timestamp with time zone DEFAULT (now() + interval '30 days'),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user_share_history table to track individual share actions
CREATE TABLE IF NOT EXISTS public.user_share_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_telegram_id bigint NOT NULL,
    diamond_stock_number text NOT NULL,
    share_type text DEFAULT 'group' NOT NULL,
    shares_remaining_after integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    analytics_data jsonb DEFAULT '{}' NOT NULL
);

-- Add RLS policies for user_share_quotas
ALTER TABLE public.user_share_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own share quotas"
ON public.user_share_quotas
FOR SELECT
USING (user_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

CREATE POLICY "Users can update their own share quotas"
ON public.user_share_quotas
FOR UPDATE
USING (user_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

CREATE POLICY "System can insert share quotas"
ON public.user_share_quotas
FOR INSERT
WITH CHECK (true);

-- Add RLS policies for user_share_history
ALTER TABLE public.user_share_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own share history"
ON public.user_share_history
FOR SELECT
USING (user_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

CREATE POLICY "Users can insert their own share history"
ON public.user_share_history
FOR INSERT
WITH CHECK (user_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

-- Add admin policies
CREATE POLICY "Admins can view all share quotas"
ON public.user_share_quotas
FOR ALL
USING (is_current_user_admin());

CREATE POLICY "Admins can view all share history"
ON public.user_share_history
FOR ALL
USING (is_current_user_admin());

-- Create function to decrement user shares
CREATE OR REPLACE FUNCTION public.use_share_quota(p_user_telegram_id bigint, p_diamond_stock_number text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shares_remaining integer;
  v_shares_used integer;
BEGIN
  -- Get current shares remaining
  SELECT shares_remaining INTO v_shares_remaining
  FROM public.user_profiles
  WHERE telegram_id = p_user_telegram_id;
  
  -- Check if user has shares remaining
  IF v_shares_remaining IS NULL OR v_shares_remaining <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Decrement shares
  UPDATE public.user_profiles
  SET shares_remaining = shares_remaining - 1,
      updated_at = now()
  WHERE telegram_id = p_user_telegram_id;
  
  -- Update or insert quota tracking
  INSERT INTO public.user_share_quotas (user_telegram_id, shares_used, shares_granted)
  VALUES (p_user_telegram_id, 1, 5)
  ON CONFLICT (user_telegram_id) DO UPDATE SET
    shares_used = user_share_quotas.shares_used + 1,
    updated_at = now();
  
  -- Record share history
  INSERT INTO public.user_share_history (
    user_telegram_id, 
    diamond_stock_number, 
    shares_remaining_after
  ) VALUES (
    p_user_telegram_id, 
    p_diamond_stock_number,
    v_shares_remaining - 1
  );
  
  RETURN TRUE;
END;
$$;

-- Create unique constraint for user_share_quotas
ALTER TABLE public.user_share_quotas 
ADD CONSTRAINT unique_user_share_quota UNIQUE (user_telegram_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_share_quotas_telegram_id ON public.user_share_quotas(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_share_history_telegram_id ON public.user_share_history(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_share_history_stock_number ON public.user_share_history(diamond_stock_number);