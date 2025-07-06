-- Create function to delete diamonds with $5000 price for admin user
CREATE OR REPLACE FUNCTION delete_diamonds_with_5000_price(p_user_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  -- Delete diamonds with price_per_carat = 5000 or calculated price = 5000
  DELETE FROM public.inventory
  WHERE user_id = p_user_id
  AND (
    price_per_carat = 5000 
    OR (price_per_carat * weight) = 5000
  );
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- Execute the function for admin user (2138564172)
SELECT delete_diamonds_with_5000_price(2138564172) as deleted_count;