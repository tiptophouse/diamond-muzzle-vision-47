
-- Create a table to track user logins
CREATE TABLE IF NOT EXISTS public.user_logins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  language_code TEXT,
  is_premium BOOLEAN DEFAULT false,
  photo_url TEXT,
  login_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  init_data_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_logins_telegram_id ON public.user_logins(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_logins_timestamp ON public.user_logins(login_timestamp DESC);

-- Enable RLS for security
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (adjust telegram_id to your admin ID)
CREATE POLICY "Admin can view all user logins" 
ON public.user_logins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE telegram_id = 2138564172 -- Your admin telegram ID
    AND public.user_profiles.telegram_id = (
      SELECT telegram_id FROM public.user_profiles 
      WHERE telegram_id = auth.uid()::text::bigint
    )
  )
);

-- Create a view for recent logins with aggregated data
CREATE OR REPLACE VIEW public.recent_user_logins AS
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
