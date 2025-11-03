-- Create table for tracking Telegram Story shares (SDK 2.0 viral feature)
CREATE TABLE public.diamond_story_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diamond_stock_number text NOT NULL,
  shared_by_telegram_id bigint,
  shared_by_name text,
  deep_link text NOT NULL,
  share_type text NOT NULL DEFAULT 'telegram_story',
  
  -- Engagement metrics
  views_count integer DEFAULT 0,
  clicks_count integer DEFAULT 0,
  conversions_count integer DEFAULT 0,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diamond_story_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert story shares
CREATE POLICY "Anyone can create story shares"
  ON public.diamond_story_shares
  FOR INSERT
  WITH CHECK (true);

-- Policy: Diamond owners can view shares of their diamonds
CREATE POLICY "Owners can view story shares for their diamonds"
  ON public.diamond_story_shares
  FOR SELECT
  USING (
    diamond_stock_number IN (
      SELECT stock_number 
      FROM public.inventory 
      WHERE user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
      AND deleted_at IS NULL
    )
  );

-- Policy: Users can view their own shares
CREATE POLICY "Users can view their own story shares"
  ON public.diamond_story_shares
  FOR SELECT
  USING (shared_by_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Indexes for performance
CREATE INDEX idx_diamond_story_shares_stock ON public.diamond_story_shares(diamond_stock_number);
CREATE INDEX idx_diamond_story_shares_user ON public.diamond_story_shares(shared_by_telegram_id);
CREATE INDEX idx_diamond_story_shares_created ON public.diamond_story_shares(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_diamond_story_shares_updated_at
  BEFORE UPDATE ON public.diamond_story_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Rollback instructions (if needed):
-- DROP TABLE IF EXISTS public.diamond_story_shares CASCADE;