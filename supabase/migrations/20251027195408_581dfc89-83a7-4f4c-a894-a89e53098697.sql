-- Create store_item_analytics table for catalog card tracking
CREATE TABLE IF NOT EXISTS public.store_item_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diamond_stock_number TEXT NOT NULL,
  user_telegram_id BIGINT,
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'view_details_click', 'contact_click', 'share_click', 'image_click')),
  view_duration_seconds INTEGER DEFAULT 0,
  viewport_percentage INTEGER DEFAULT 0,
  scroll_position INTEGER DEFAULT 0,
  device_type TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create diamond_detail_views table for detail page tracking
CREATE TABLE IF NOT EXISTS public.diamond_detail_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diamond_stock_number TEXT NOT NULL,
  user_telegram_id BIGINT,
  session_id UUID NOT NULL,
  came_from TEXT NOT NULL CHECK (came_from IN ('catalog', 'share_link', 'direct', 'search')),
  catalog_position INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  viewed_certificate BOOLEAN DEFAULT false,
  viewed_360 BOOLEAN DEFAULT false,
  clicked_contact BOOLEAN DEFAULT false,
  clicked_share BOOLEAN DEFAULT false,
  scroll_depth_percentage INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.store_item_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diamond_detail_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_item_analytics
CREATE POLICY "Anyone can insert analytics data"
ON public.store_item_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Diamond owners can view analytics for their diamonds"
ON public.store_item_analytics
FOR SELECT
USING (
  diamond_stock_number IN (
    SELECT stock_number FROM inventory 
    WHERE user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
    AND deleted_at IS NULL
  )
);

-- RLS Policies for diamond_detail_views
CREATE POLICY "Anyone can insert detail view data"
ON public.diamond_detail_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own detail views"
ON public.diamond_detail_views
FOR UPDATE
USING (session_id IN (SELECT session_id FROM diamond_detail_views));

CREATE POLICY "Diamond owners can view detail analytics for their diamonds"
ON public.diamond_detail_views
FOR SELECT
USING (
  diamond_stock_number IN (
    SELECT stock_number FROM inventory 
    WHERE user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
    AND deleted_at IS NULL
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_item_analytics_stock_number ON public.store_item_analytics(diamond_stock_number);
CREATE INDEX IF NOT EXISTS idx_store_item_analytics_timestamp ON public.store_item_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_store_item_analytics_session ON public.store_item_analytics(session_id);

CREATE INDEX IF NOT EXISTS idx_diamond_detail_views_stock_number ON public.diamond_detail_views(diamond_stock_number);
CREATE INDEX IF NOT EXISTS idx_diamond_detail_views_timestamp ON public.diamond_detail_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_diamond_detail_views_session ON public.diamond_detail_views(session_id);