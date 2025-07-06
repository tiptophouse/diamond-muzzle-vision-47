-- Create Keshett Agreements table for diamond trading locks
CREATE TABLE public.keshett_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diamond_stock_number TEXT NOT NULL,
  diamond_data JSONB NOT NULL,
  seller_telegram_id BIGINT NOT NULL,
  buyer_telegram_id BIGINT NOT NULL,
  agreed_price NUMERIC NOT NULL,
  terms JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expiry_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on keshett_agreements
ALTER TABLE public.keshett_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies for keshett_agreements
CREATE POLICY "Seller can create and manage keshett agreements" 
ON public.keshett_agreements 
FOR ALL 
USING (seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0))
WITH CHECK (seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Buyer can view and accept keshett agreements" 
ON public.keshett_agreements 
FOR SELECT 
USING (buyer_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Buyer can update keshett agreements status" 
ON public.keshett_agreements 
FOR UPDATE 
USING (buyer_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0))
WITH CHECK (buyer_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Create trigger for auto-updating timestamps
CREATE TRIGGER update_keshett_agreements_updated_at
BEFORE UPDATE ON public.keshett_agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to expire keshett agreements
CREATE OR REPLACE FUNCTION public.expire_keshett_agreements()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_expired_count INTEGER;
BEGIN
  -- Update expired agreements
  UPDATE public.keshett_agreements
  SET status = 'expired',
      updated_at = now()
  WHERE status IN ('pending', 'active')
    AND expiry_at < now();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RETURN v_expired_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error expiring keshett agreements: %', SQLERRM;
END;
$function$;