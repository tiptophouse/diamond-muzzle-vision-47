-- Drop the old policy that checks inventory table
DROP POLICY IF EXISTS "Sellers can create auctions" ON public.auctions;

-- Create new policy that only verifies seller identity (no inventory check)
CREATE POLICY "Sellers can create auctions" ON public.auctions
FOR INSERT
WITH CHECK (
  seller_telegram_id = COALESCE(
    (current_setting('app.current_user_id', true))::bigint,
    (0)::bigint
  )
);