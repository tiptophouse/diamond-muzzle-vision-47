-- Create table to track Telegram button clicks
CREATE TABLE IF NOT EXISTS public.telegram_button_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  user_first_name TEXT,
  user_username TEXT,
  button_id TEXT NOT NULL,
  button_label TEXT NOT NULL,
  target_page TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_button_clicks_user ON public.telegram_button_clicks(telegram_user_id);
CREATE INDEX idx_button_clicks_button ON public.telegram_button_clicks(button_id);
CREATE INDEX idx_button_clicks_date ON public.telegram_button_clicks(clicked_at DESC);

-- Enable RLS
ALTER TABLE public.telegram_button_clicks ENABLE ROW LEVEL SECURITY;

-- Admin can view all clicks
CREATE POLICY "Admins can view all button clicks"
ON public.telegram_button_clicks
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

-- Function can insert clicks
CREATE POLICY "Service role can insert clicks"
ON public.telegram_button_clicks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create table to track message campaigns
CREATE TABLE IF NOT EXISTS public.telegram_group_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  target_group_id BIGINT NOT NULL,
  message_id BIGINT,
  sent_by_telegram_id BIGINT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_clicks INTEGER DEFAULT 0,
  unique_users_clicked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for campaigns
CREATE INDEX idx_campaigns_date ON public.telegram_group_campaigns(sent_at DESC);

-- Enable RLS
ALTER TABLE public.telegram_group_campaigns ENABLE ROW LEVEL SECURITY;

-- Admin can view all campaigns
CREATE POLICY "Admins can view all campaigns"
ON public.telegram_group_campaigns
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

-- Admin can insert campaigns
CREATE POLICY "Admins can insert campaigns"
ON public.telegram_group_campaigns
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Trigger to update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.telegram_group_campaigns
  SET 
    total_clicks = (
      SELECT COUNT(*) 
      FROM public.telegram_button_clicks 
      WHERE created_at >= NEW.created_at - INTERVAL '1 hour'
    ),
    unique_users_clicked = (
      SELECT COUNT(DISTINCT telegram_user_id)
      FROM public.telegram_button_clicks
      WHERE created_at >= NEW.created_at - INTERVAL '1 hour'
    ),
    updated_at = now()
  WHERE sent_at >= NEW.created_at - INTERVAL '1 hour'
  AND sent_at <= NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_campaign_stats_trigger
AFTER INSERT ON public.telegram_button_clicks
FOR EACH ROW
EXECUTE FUNCTION update_campaign_stats();