-- Add trial tracking to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '14 days');

-- Create index for efficient trial expiration queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_expires ON public.user_profiles(trial_expires_at);

-- Function to check if user trial is active
CREATE OR REPLACE FUNCTION public.is_trial_active(p_telegram_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT trial_expires_at > now() 
     FROM public.user_profiles 
     WHERE telegram_id = p_telegram_id),
    true  -- Default to true for new users
  );
$$;

-- Function to log subscription attempts
CREATE OR REPLACE FUNCTION public.log_subscription_attempt(
  p_telegram_id bigint,
  p_has_subscription boolean,
  p_trial_expired boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.subscription_attempts (
    telegram_id,
    has_subscription,
    trial_expired,
    attempted_at
  ) VALUES (
    p_telegram_id,
    p_has_subscription,
    p_trial_expired,
    now()
  );
END;
$$;

-- Create subscription attempts log table
CREATE TABLE IF NOT EXISTS public.subscription_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint NOT NULL,
  has_subscription boolean NOT NULL,
  trial_expired boolean NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscription_attempts_telegram_id ON public.subscription_attempts(telegram_id);
CREATE INDEX IF NOT EXISTS idx_subscription_attempts_attempted_at ON public.subscription_attempts(attempted_at);

-- Enable RLS
ALTER TABLE public.subscription_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all attempts
CREATE POLICY "Admins can view subscription attempts"
ON public.subscription_attempts
FOR SELECT
USING (public.is_current_user_admin());

-- Policy: Users can view their own attempts
CREATE POLICY "Users can view own subscription attempts"
ON public.subscription_attempts
FOR SELECT
USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));