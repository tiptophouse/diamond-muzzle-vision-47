-- Drop foreign key constraint that blocks auction creation for FastAPI-managed diamonds
-- Diamonds are the single source of truth in FastAPI, not Supabase inventory table
-- Auctions reference diamonds by stock_number string identifier
-- Application logic validates diamond existence via FastAPI before auction creation

ALTER TABLE public.auctions 
DROP CONSTRAINT IF EXISTS fk_auction_diamond;

-- Add comment to document the architectural decision
COMMENT ON COLUMN public.auctions.stock_number IS 'References diamond in FastAPI backend. No FK constraint because FastAPI is source of truth for diamonds.';