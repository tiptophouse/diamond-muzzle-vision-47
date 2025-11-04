-- Create retention_campaigns table for tracking customer retention messages
CREATE TABLE IF NOT EXISTS public.retention_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_telegram_id BIGINT NOT NULL,
  campaign_type TEXT NOT NULL,
  message_content TEXT NOT NULL,
  is_paying BOOLEAN DEFAULT FALSE,
  has_inventory BOOLEAN DEFAULT FALSE,
  days_since_signup INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_retention_campaigns_user ON public.retention_campaigns(user_telegram_id);
CREATE INDEX idx_retention_campaigns_sent_at ON public.retention_campaigns(sent_at DESC);
CREATE INDEX idx_retention_campaigns_type ON public.retention_campaigns(campaign_type);

-- Enable RLS
ALTER TABLE public.retention_campaigns ENABLE ROW LEVEL SECURITY;

-- Admin can view all retention campaigns
CREATE POLICY "Admin can view all retention campaigns"
ON public.retention_campaigns
FOR SELECT
USING (public.is_current_user_admin());

-- Admin can insert retention campaigns
CREATE POLICY "Admin can insert retention campaigns"
ON public.retention_campaigns
FOR INSERT
WITH CHECK (public.is_current_user_admin());

-- Users can view their own retention campaign history
CREATE POLICY "Users can view their own retention campaigns"
ON public.retention_campaigns
FOR SELECT
USING (user_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));