
-- Create wishlist table to store user preferences
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_telegram_id BIGINT NOT NULL,
  diamond_owner_telegram_id BIGINT NOT NULL,
  diamond_stock_number TEXT NOT NULL,
  diamond_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Users can manage their own wishlist items
CREATE POLICY "Users can manage their own wishlist items" 
  ON public.wishlist 
  FOR ALL 
  USING (visitor_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Diamond owners can view wishlist for their diamonds
CREATE POLICY "Diamond owners can view wishlist for their diamonds" 
  ON public.wishlist 
  FOR SELECT 
  USING (diamond_owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Add trigger for updating updated_at
CREATE TRIGGER update_wishlist_updated_at 
  BEFORE UPDATE ON public.wishlist 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
