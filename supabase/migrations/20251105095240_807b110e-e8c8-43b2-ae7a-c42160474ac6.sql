-- Create table to track diamond views from Telegram messages
CREATE TABLE IF NOT EXISTS public.telegram_diamond_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_telegram_id BIGINT NOT NULL,
  diamond_stock_number TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source TEXT DEFAULT 'telegram_message',
  referrer_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_telegram_diamond_views_viewer 
  ON public.telegram_diamond_views(viewer_telegram_id);

CREATE INDEX IF NOT EXISTS idx_telegram_diamond_views_stock 
  ON public.telegram_diamond_views(diamond_stock_number);

CREATE INDEX IF NOT EXISTS idx_telegram_diamond_views_date 
  ON public.telegram_diamond_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.telegram_diamond_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert their own views
CREATE POLICY "Users can track their own diamond views"
  ON public.telegram_diamond_views
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all analytics
CREATE POLICY "Admins can view all diamond views"
  ON public.telegram_diamond_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE telegram_id = (
        SELECT telegram_id FROM public.user_profiles 
        WHERE id = auth.uid()
      )
      AND is_active = true
    )
  );

-- Policy: Users can view their own views
CREATE POLICY "Users can view their own diamond views"
  ON public.telegram_diamond_views
  FOR SELECT
  USING (
    viewer_telegram_id = (
      SELECT telegram_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create analytics view for sellers
CREATE OR REPLACE VIEW public.diamond_view_analytics AS
SELECT 
  diamond_stock_number,
  COUNT(*) as total_views,
  COUNT(DISTINCT viewer_telegram_id) as unique_viewers,
  MAX(viewed_at) as last_viewed_at,
  DATE_TRUNC('day', viewed_at) as view_date
FROM public.telegram_diamond_views
GROUP BY diamond_stock_number, DATE_TRUNC('day', viewed_at);

COMMENT ON TABLE public.telegram_diamond_views IS 'Tracks when buyers view diamonds from Telegram messages';
COMMENT ON VIEW public.diamond_view_analytics IS 'Analytics summary of diamond views from Telegram';