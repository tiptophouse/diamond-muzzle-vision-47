-- Drop existing function to recreate with new signature
DROP FUNCTION IF EXISTS public.create_auction_with_context(text, numeric, numeric, text, timestamptz, bigint);

-- Create enhanced RPC function that handles both auction and diamond snapshot atomically
CREATE OR REPLACE FUNCTION public.create_auction_with_context(
  -- Auction parameters
  p_stock_number text,
  p_starting_price numeric,
  p_min_increment numeric,
  p_currency text,
  p_ends_at timestamptz,
  p_seller_telegram_id bigint,
  
  -- Diamond snapshot parameters
  p_diamond_shape text,
  p_diamond_weight numeric,
  p_diamond_color text,
  p_diamond_clarity text,
  p_diamond_cut text,
  p_diamond_polish text DEFAULT NULL,
  p_diamond_symmetry text DEFAULT NULL,
  p_diamond_fluorescence text DEFAULT NULL,
  p_diamond_measurements text DEFAULT NULL,
  p_diamond_table_percentage numeric DEFAULT NULL,
  p_diamond_depth_percentage numeric DEFAULT NULL,
  p_diamond_certificate_number bigint DEFAULT NULL,
  p_diamond_lab text DEFAULT NULL,
  p_diamond_picture text DEFAULT NULL,
  p_diamond_certificate_url text DEFAULT NULL,
  p_diamond_video_url text DEFAULT NULL,
  p_diamond_price_per_carat numeric DEFAULT NULL,
  p_diamond_total_price numeric DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auction_id uuid;
  v_auction_record json;
BEGIN
  -- Set user context for RLS (within this transaction)
  PERFORM set_config('app.current_telegram_id', p_seller_telegram_id::text, false);
  PERFORM set_config('app.current_user_id', p_seller_telegram_id::text, false);
  
  -- Insert auction and capture ID
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
    p_starting_price,
    p_min_increment,
    p_currency,
    p_ends_at,
    p_seller_telegram_id
  )
  RETURNING id INTO v_auction_id;
  
  -- Insert diamond snapshot (same transaction, same context)
  INSERT INTO public.auction_diamonds (
    auction_id,
    stock_number,
    shape,
    weight,
    color,
    clarity,
    cut,
    polish,
    symmetry,
    fluorescence,
    measurements,
    table_percentage,
    depth_percentage,
    certificate_number,
    lab,
    picture,
    certificate_url,
    video_url,
    price_per_carat,
    total_price
  ) VALUES (
    v_auction_id,
    p_stock_number,
    p_diamond_shape,
    p_diamond_weight,
    p_diamond_color,
    p_diamond_clarity,
    p_diamond_cut,
    p_diamond_polish,
    p_diamond_symmetry,
    p_diamond_fluorescence,
    p_diamond_measurements,
    p_diamond_table_percentage,
    p_diamond_depth_percentage,
    p_diamond_certificate_number,
    p_diamond_lab,
    p_diamond_picture,
    p_diamond_certificate_url,
    p_diamond_video_url,
    p_diamond_price_per_carat,
    COALESCE(p_diamond_total_price, p_diamond_price_per_carat * p_diamond_weight)
  );
  
  -- Build and return complete auction record
  SELECT json_build_object(
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
  ) INTO v_auction_record
  FROM public.auctions
  WHERE id = v_auction_id;
  
  RETURN v_auction_record;
END;
$$;