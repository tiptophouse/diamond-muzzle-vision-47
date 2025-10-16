-- Create offers table for diamond marketplace
CREATE TABLE IF NOT EXISTS public.diamond_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diamond_stock_number TEXT NOT NULL,
  diamond_owner_telegram_id BIGINT NOT NULL,
  buyer_telegram_id BIGINT NOT NULL,
  buyer_name TEXT,
  buyer_contact TEXT,
  offered_price NUMERIC NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.diamond_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Buyers can create offers
CREATE POLICY "Buyers can create offers"
ON public.diamond_offers
FOR INSERT
WITH CHECK (buyer_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

-- Policy: Buyers can view their own offers
CREATE POLICY "Buyers can view their offers"
ON public.diamond_offers
FOR SELECT
USING (buyer_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

-- Policy: Owners can view offers on their diamonds
CREATE POLICY "Owners can view offers on their diamonds"
ON public.diamond_offers
FOR SELECT
USING (diamond_owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

-- Policy: Owners can update offer status
CREATE POLICY "Owners can update offer status"
ON public.diamond_offers
FOR UPDATE
USING (diamond_owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint))
WITH CHECK (diamond_owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0::bigint));

-- Create index for performance
CREATE INDEX idx_diamond_offers_owner ON public.diamond_offers(diamond_owner_telegram_id);
CREATE INDEX idx_diamond_offers_buyer ON public.diamond_offers(buyer_telegram_id);
CREATE INDEX idx_diamond_offers_stock ON public.diamond_offers(diamond_stock_number);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_diamond_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_diamond_offers_updated_at
BEFORE UPDATE ON public.diamond_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_diamond_offers_updated_at();

COMMENT ON TABLE public.diamond_offers IS 'Stores price offers from buyers for diamonds in the marketplace';