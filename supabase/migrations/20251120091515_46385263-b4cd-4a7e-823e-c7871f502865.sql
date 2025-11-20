-- Create auction_diamonds table to store diamond snapshots
CREATE TABLE IF NOT EXISTS public.auction_diamonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  stock_number TEXT NOT NULL,
  shape TEXT,
  weight NUMERIC,
  color TEXT,
  clarity TEXT,
  cut TEXT,
  polish TEXT,
  symmetry TEXT,
  fluorescence TEXT,
  measurements TEXT,
  table_percentage NUMERIC,
  depth_percentage NUMERIC,
  certificate_number BIGINT,
  lab TEXT,
  picture TEXT,
  certificate_url TEXT,
  video_url TEXT,
  price_per_carat NUMERIC,
  total_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(auction_id)
);

-- Enable RLS
ALTER TABLE public.auction_diamonds ENABLE ROW LEVEL SECURITY;

-- Anyone can view diamond data for active auctions
CREATE POLICY "Anyone can view auction diamonds"
  ON public.auction_diamonds
  FOR SELECT
  USING (
    auction_id IN (
      SELECT id FROM public.auctions 
      WHERE status = 'active' 
      OR seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
    )
  );

-- Sellers can insert diamond data when creating auctions
CREATE POLICY "Sellers can insert auction diamonds"
  ON public.auction_diamonds
  FOR INSERT
  WITH CHECK (
    auction_id IN (
      SELECT id FROM public.auctions 
      WHERE seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_auction_diamonds_auction_id ON public.auction_diamonds(auction_id);
CREATE INDEX idx_auction_diamonds_stock_number ON public.auction_diamonds(stock_number);