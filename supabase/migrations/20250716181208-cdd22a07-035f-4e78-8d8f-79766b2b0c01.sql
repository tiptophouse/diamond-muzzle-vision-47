-- Create diamond_share_analytics table for tracking shared diamond views
CREATE TABLE public.diamond_share_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diamond_stock_number TEXT NOT NULL,
  owner_telegram_id BIGINT NOT NULL,
  viewer_telegram_id BIGINT NULL,
  viewer_ip_address INET NULL,
  viewer_user_agent TEXT NULL,
  device_type TEXT NULL,
  referrer TEXT NULL,
  session_id UUID NULL,
  view_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER NULL,
  returned_visitor BOOLEAN DEFAULT false,
  viewed_other_diamonds BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diamond_share_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Diamond owners can view analytics for their diamonds"
ON public.diamond_share_analytics
FOR SELECT
USING (owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Anyone can insert analytics data"
ON public.diamond_share_analytics
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_diamond_share_analytics_stock_owner ON public.diamond_share_analytics(diamond_stock_number, owner_telegram_id);
CREATE INDEX idx_diamond_share_analytics_timestamp ON public.diamond_share_analytics(view_timestamp);
CREATE INDEX idx_diamond_share_analytics_session ON public.diamond_share_analytics(session_id);