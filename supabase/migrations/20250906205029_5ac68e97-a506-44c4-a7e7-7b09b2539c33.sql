-- Create match_notifications table for tracking search results and matches
CREATE TABLE IF NOT EXISTS public.match_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id bigint NOT NULL,
  seller_id bigint NOT NULL,
  diamond_id text NOT NULL,
  is_match boolean NOT NULL DEFAULT true,
  confidence_score numeric DEFAULT 0.8,
  details_json jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_notifications_buyer_id ON public.match_notifications(buyer_id);
CREATE INDEX IF NOT EXISTS idx_match_notifications_seller_id ON public.match_notifications(seller_id);
CREATE INDEX IF NOT EXISTS idx_match_notifications_created_at ON public.match_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_match_notifications_is_match ON public.match_notifications(is_match);

-- Enable RLS
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own match notifications as buyer"
ON public.match_notifications FOR SELECT
USING (buyer_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can view their own match notifications as seller"
ON public.match_notifications FOR SELECT
USING (seller_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "System can insert match notifications"
ON public.match_notifications FOR INSERT
WITH CHECK (true);

-- Create buyer_requests table for storing search criteria
CREATE TABLE IF NOT EXISTS public.buyer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id bigint NOT NULL,
  extracted_criteria_json jsonb NOT NULL DEFAULT '{}',
  original_message text,
  confidence_score numeric DEFAULT 0.8,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_buyer_requests_buyer_id ON public.buyer_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_created_at ON public.buyer_requests(created_at);

-- Enable RLS
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own buyer requests"
ON public.buyer_requests FOR SELECT
USING (buyer_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "System can manage buyer requests"
ON public.buyer_requests FOR ALL
USING (true)
WITH CHECK (true);