-- Create wishlist table for traders to save diamonds they're interested in
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_telegram_id BIGINT NOT NULL,
  diamond_owner_telegram_id BIGINT NOT NULL,
  diamond_stock_number TEXT NOT NULL,
  diamond_data JSONB NOT NULL, -- Store diamond details for reference
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(visitor_telegram_id, diamond_stock_number, diamond_owner_telegram_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Visitors can manage their own wishlist items
CREATE POLICY "Users can manage their own wishlist items" 
ON public.wishlist 
FOR ALL 
USING (visitor_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Diamond owners can view wishlist items for their diamonds
CREATE POLICY "Diamond owners can view wishlist for their diamonds" 
ON public.wishlist 
FOR SELECT 
USING (diamond_owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wishlist_updated_at
BEFORE UPDATE ON public.wishlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();