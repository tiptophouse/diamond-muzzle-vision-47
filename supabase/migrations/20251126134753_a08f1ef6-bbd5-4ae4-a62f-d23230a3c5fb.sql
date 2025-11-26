-- Phase 1: Add presence tracking and interest signals
-- Create auction_presence table for live spectator tracking
CREATE TABLE IF NOT EXISTS public.auction_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  telegram_id bigint NOT NULL,
  user_name text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_heartbeat timestamptz NOT NULL DEFAULT now(),
  UNIQUE(auction_id, telegram_id)
);

-- Create indexes for performance
CREATE INDEX idx_auction_presence_auction_id ON public.auction_presence(auction_id);
CREATE INDEX idx_auction_presence_heartbeat ON public.auction_presence(last_heartbeat);

-- Create auction_interest table for "I'm Interested" signals
CREATE TABLE IF NOT EXISTS public.auction_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  telegram_id bigint NOT NULL,
  user_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_to_bid boolean DEFAULT false,
  UNIQUE(auction_id, telegram_id)
);

CREATE INDEX idx_auction_interest_auction_id ON public.auction_interest(auction_id);

-- Create auction_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS public.auction_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  telegram_id bigint NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('fire', 'shocked', 'diamond', 'clap', 'eyes')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 seconds')
);

CREATE INDEX idx_auction_reactions_auction_id ON public.auction_reactions(auction_id);
CREATE INDEX idx_auction_reactions_expires_at ON public.auction_reactions(expires_at);

-- Add new columns to auctions table for viral mechanics
ALTER TABLE public.auctions 
  ADD COLUMN IF NOT EXISTS extension_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS heat_level text DEFAULT 'cold' CHECK (heat_level IN ('cold', 'warm', 'hot', 'fire'));

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_interest;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_reactions;

-- RLS policies for auction_presence
ALTER TABLE public.auction_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presence"
  ON public.auction_presence FOR SELECT
  USING (true);

CREATE POLICY "Users can join presence"
  ON public.auction_presence FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own presence"
  ON public.auction_presence FOR UPDATE
  USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can leave presence"
  ON public.auction_presence FOR DELETE
  USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- RLS policies for auction_interest
ALTER TABLE public.auction_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interest signals"
  ON public.auction_interest FOR SELECT
  USING (true);

CREATE POLICY "Users can signal interest"
  ON public.auction_interest FOR INSERT
  WITH CHECK (true);

-- RLS policies for auction_reactions
ALTER TABLE public.auction_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON public.auction_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON public.auction_reactions FOR INSERT
  WITH CHECK (true);

-- Function to clean up expired reactions
CREATE OR REPLACE FUNCTION clean_expired_reactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.auction_reactions WHERE expires_at < now();
END;
$$;

-- Function to update auction heat level based on activity
CREATE OR REPLACE FUNCTION update_auction_heat_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_interest_count int;
  v_recent_bids int;
  v_heat text;
BEGIN
  -- Count interest signals
  SELECT COUNT(*) INTO v_interest_count
  FROM public.auction_interest
  WHERE auction_id = NEW.auction_id;
  
  -- Count recent bids (last 5 minutes)
  SELECT COUNT(*) INTO v_recent_bids
  FROM public.auction_bids
  WHERE auction_id = NEW.auction_id
    AND created_at > now() - interval '5 minutes';
  
  -- Determine heat level
  IF v_recent_bids >= 3 THEN
    v_heat := 'fire';
  ELSIF v_interest_count >= 10 OR v_recent_bids >= 2 THEN
    v_heat := 'hot';
  ELSIF v_interest_count >= 5 OR v_recent_bids >= 1 THEN
    v_heat := 'warm';
  ELSE
    v_heat := 'cold';
  END IF;
  
  -- Update auction heat level
  UPDATE public.auctions
  SET heat_level = v_heat
  WHERE id = NEW.auction_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update heat level on interest signals
CREATE TRIGGER update_heat_on_interest
  AFTER INSERT ON public.auction_interest
  FOR EACH ROW
  EXECUTE FUNCTION update_auction_heat_level();

-- Trigger to update heat level on bids
CREATE TRIGGER update_heat_on_bid
  AFTER INSERT ON public.auction_bids
  FOR EACH ROW
  EXECUTE FUNCTION update_auction_heat_level();