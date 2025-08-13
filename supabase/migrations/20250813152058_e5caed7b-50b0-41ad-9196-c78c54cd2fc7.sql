
-- Create diamond_shares table for tracking when diamonds are shared
CREATE TABLE public.diamond_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diamond_id TEXT NOT NULL,
  stock_number TEXT NOT NULL,
  shared_by BIGINT NOT NULL,
  share_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diamond_views table for tracking diamond view analytics
CREATE TABLE public.diamond_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diamond_id TEXT NOT NULL,
  session_id UUID NOT NULL,
  viewer_telegram_id BIGINT,
  view_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_interaction TIMESTAMP WITH TIME ZONE,
  total_view_time INTEGER DEFAULT 0,
  interactions JSONB DEFAULT '[]'::jsonb,
  reshared BOOLEAN DEFAULT false,
  device_type TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- Add Row Level Security (RLS)
ALTER TABLE public.diamond_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diamond_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for diamond_shares
CREATE POLICY "Diamond owners can view shares of their diamonds" 
  ON public.diamond_shares 
  FOR SELECT 
  USING (shared_by = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can create diamond shares" 
  ON public.diamond_shares 
  FOR INSERT 
  WITH CHECK (shared_by = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- RLS policies for diamond_views
CREATE POLICY "Anyone can insert view analytics" 
  ON public.diamond_views 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update view analytics" 
  ON public.diamond_views 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Diamond owners can view analytics for their diamonds" 
  ON public.diamond_views 
  FOR SELECT 
  USING (
    diamond_id IN (
      SELECT stock_number 
      FROM public.inventory 
      WHERE user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
      AND deleted_at IS NULL
    )
  );
