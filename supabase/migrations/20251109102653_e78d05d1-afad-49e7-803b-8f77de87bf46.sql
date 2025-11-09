-- Create table for tracking SFTP button clicks and credential generation
CREATE TABLE IF NOT EXISTS public.acadia_sftp_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('button_click', 'credentials_generated', 'credentials_sent')),
  campaign_id UUID REFERENCES public.notifications(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.acadia_sftp_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all SFTP analytics"
ON public.acadia_sftp_analytics
FOR SELECT
USING (
  is_current_user_admin()
);

CREATE POLICY "System can insert SFTP analytics"
ON public.acadia_sftp_analytics
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_acadia_sftp_analytics_telegram_id ON public.acadia_sftp_analytics(telegram_id);
CREATE INDEX idx_acadia_sftp_analytics_event_type ON public.acadia_sftp_analytics(event_type);
CREATE INDEX idx_acadia_sftp_analytics_created_at ON public.acadia_sftp_analytics(created_at DESC);

-- Add a new table for tracking click-through rates on campaign buttons
CREATE TABLE IF NOT EXISTS public.campaign_button_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id),
  telegram_id BIGINT NOT NULL,
  button_text TEXT NOT NULL,
  button_url TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.campaign_button_clicks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all button clicks"
ON public.campaign_button_clicks
FOR SELECT
USING (
  is_current_user_admin()
);

CREATE POLICY "System can insert button clicks"
ON public.campaign_button_clicks
FOR INSERT
WITH CHECK (true);

-- Create index
CREATE INDEX idx_campaign_button_clicks_notification_id ON public.campaign_button_clicks(notification_id);
CREATE INDEX idx_campaign_button_clicks_telegram_id ON public.campaign_button_clicks(telegram_id);
CREATE INDEX idx_campaign_button_clicks_clicked_at ON public.campaign_button_clicks(clicked_at DESC);