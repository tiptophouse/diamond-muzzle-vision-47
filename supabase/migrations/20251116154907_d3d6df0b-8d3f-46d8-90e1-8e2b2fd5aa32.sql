-- Add auction tracking fields
ALTER TABLE public.auctions 
  ADD COLUMN IF NOT EXISTS reserve_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS message_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_viewers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bid_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_extend BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_seller BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS diamond_data JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON public.auctions(seller_telegram_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_ends_at ON public.auctions(ends_at);

-- Create auction analytics table
CREATE TABLE IF NOT EXISTS public.auction_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  telegram_id BIGINT,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'bid_attempt', 'bid_success')),
  event_data JSONB DEFAULT '{}'::jsonb,
  group_chat_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_auction_analytics_auction ON public.auction_analytics(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_analytics_event ON public.auction_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_auction_analytics_telegram ON public.auction_analytics(telegram_id);
CREATE INDEX IF NOT EXISTS idx_auction_analytics_created ON public.auction_analytics(created_at);

-- Enable RLS on auction_analytics
ALTER TABLE public.auction_analytics ENABLE ROW LEVEL SECURITY;

-- Allow users to view analytics for their auctions
CREATE POLICY "Users can view their auction analytics"
  ON public.auction_analytics FOR SELECT
  USING (
    auction_id IN (
      SELECT id FROM public.auctions 
      WHERE seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
    )
  );

-- Allow system to insert analytics (from webhook)
CREATE POLICY "System can insert auction analytics"
  ON public.auction_analytics FOR INSERT
  WITH CHECK (true);