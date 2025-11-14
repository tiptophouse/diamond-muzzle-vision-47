-- First, add unique constraint to inventory.stock_number
ALTER TABLE public.inventory ADD CONSTRAINT inventory_stock_number_unique UNIQUE (stock_number);

-- Create auctions table
CREATE TABLE public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_number TEXT NOT NULL,
  seller_telegram_id BIGINT NOT NULL,
  starting_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2) NOT NULL,
  min_increment NUMERIC(10,2) NOT NULL DEFAULT 50,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled', 'sold')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  winner_telegram_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_auction_diamond FOREIGN KEY (stock_number) 
    REFERENCES public.inventory(stock_number) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_auctions_seller ON public.auctions(seller_telegram_id);
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_auctions_ends_at ON public.auctions(ends_at) WHERE status = 'active';
CREATE INDEX idx_auctions_stock ON public.auctions(stock_number);

-- Enable RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auctions
CREATE POLICY "Anyone can view active auctions" ON public.auctions
  FOR SELECT USING (
    status = 'active' OR 
    seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  );

CREATE POLICY "Sellers can create auctions" ON public.auctions
  FOR INSERT WITH CHECK (
    seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
    AND EXISTS (
      SELECT 1 FROM public.inventory 
      WHERE inventory.stock_number = auctions.stock_number 
      AND inventory.user_id = auctions.seller_telegram_id
      AND inventory.deleted_at IS NULL
    )
  );

CREATE POLICY "Sellers can update their auctions" ON public.auctions
  FOR UPDATE USING (
    seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  );

-- Create auction_bids table
CREATE TABLE public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_telegram_id BIGINT NOT NULL,
  bidder_name TEXT,
  bid_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_auction_bid_amount UNIQUE (auction_id, bid_amount)
);

-- Create indexes for auction_bids
CREATE INDEX idx_auction_bids_auction_id ON public.auction_bids(auction_id);
CREATE INDEX idx_auction_bids_bidder ON public.auction_bids(bidder_telegram_id);
CREATE INDEX idx_auction_bids_created_at ON public.auction_bids(auction_id, created_at DESC);

-- Enable RLS for auction_bids
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auction_bids
CREATE POLICY "Anyone can view auction bids" ON public.auction_bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE auctions.id = auction_bids.auction_id
    )
  );

CREATE POLICY "Users can place bids" ON public.auction_bids
  FOR INSERT WITH CHECK (
    bidder_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
    AND EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE auctions.id = auction_bids.auction_id 
      AND auctions.status = 'active'
      AND auctions.ends_at > now()
    )
  );

-- Helper function to expire auctions
CREATE OR REPLACE FUNCTION public.expire_auctions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.auctions
  SET status = 'ended',
      updated_at = now()
  WHERE status = 'active'
    AND ends_at < now();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RETURN v_expired_count;
END;
$$;