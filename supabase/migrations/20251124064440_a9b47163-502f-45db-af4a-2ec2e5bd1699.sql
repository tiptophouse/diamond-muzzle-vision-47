-- Create RPC function for atomic auction creation with context
CREATE OR REPLACE FUNCTION public.create_auction_with_context(
  p_stock_number text,
  p_starting_price numeric,
  p_min_increment numeric,
  p_currency text,
  p_ends_at timestamptz,
  p_seller_telegram_id bigint
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auction_record json;
BEGIN
  -- Set user context for RLS (within this transaction)
  PERFORM set_config('app.current_telegram_id', p_seller_telegram_id::text, false);
  PERFORM set_config('app.current_user_id', p_seller_telegram_id::text, false);
  
  -- Insert auction and return the record
  INSERT INTO public.auctions (
    stock_number,
    starting_price,
    current_price,
    min_increment,
    currency,
    ends_at,
    seller_telegram_id
  ) VALUES (
    p_stock_number,
    p_starting_price,
    p_starting_price, -- current_price starts at starting_price
    p_min_increment,
    p_currency,
    p_ends_at,
    p_seller_telegram_id
  )
  RETURNING json_build_object(
    'id', id,
    'stock_number', stock_number,
    'starting_price', starting_price,
    'current_price', current_price,
    'min_increment', min_increment,
    'currency', currency,
    'ends_at', ends_at,
    'seller_telegram_id', seller_telegram_id,
    'status', status,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_auction_record;
  
  RETURN v_auction_record;
END;
$$;