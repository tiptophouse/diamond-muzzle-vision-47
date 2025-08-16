
-- Create table to track diamond shares and performance
CREATE TABLE IF NOT EXISTS public.store_item_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_telegram_id BIGINT NOT NULL,
  shared_with_telegram_id BIGINT,
  diamond_stock_number TEXT NOT NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('individual_item', 'entire_store')),
  share_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create table to track viewing analytics
CREATE TABLE IF NOT EXISTS public.store_item_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES public.store_item_shares(id),
  viewer_telegram_id BIGINT,
  diamond_stock_number TEXT NOT NULL,
  view_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  view_ended_at TIMESTAMP WITH TIME ZONE,
  total_view_duration_seconds INTEGER DEFAULT 0,
  device_info JSONB,
  session_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table to track reshares
CREATE TABLE IF NOT EXISTS public.store_item_reshares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_share_id UUID REFERENCES public.store_item_shares(id),
  reshared_by_telegram_id BIGINT NOT NULL,
  reshared_to_telegram_id BIGINT,
  reshare_type TEXT NOT NULL CHECK (reshare_type IN ('forward', 'copy_link', 'screenshot')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.store_item_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_item_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_item_reshares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_item_shares
CREATE POLICY "Users can create their own shares" ON public.store_item_shares
  FOR INSERT WITH CHECK (owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can view their own shares" ON public.store_item_shares
  FOR SELECT USING (owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Users can update their own shares" ON public.store_item_shares
  FOR UPDATE USING (owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Anyone can view active public shares" ON public.store_item_shares
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for store_item_views
CREATE POLICY "Anyone can insert view analytics" ON public.store_item_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Share owners can view analytics" ON public.store_item_views
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.store_item_shares 
    WHERE store_item_shares.id = store_item_views.share_id 
    AND store_item_shares.owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  ));

CREATE POLICY "Users can update view sessions" ON public.store_item_views
  FOR UPDATE USING (true);

-- RLS Policies for store_item_reshares
CREATE POLICY "Anyone can track reshares" ON public.store_item_reshares
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Share owners can view reshare analytics" ON public.store_item_reshares
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.store_item_shares 
    WHERE store_item_shares.id = store_item_reshares.original_share_id 
    AND store_item_shares.owner_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_item_shares_owner ON public.store_item_shares(owner_telegram_id);
CREATE INDEX IF NOT EXISTS idx_store_item_shares_stock_number ON public.store_item_shares(diamond_stock_number);
CREATE INDEX IF NOT EXISTS idx_store_item_views_share_id ON public.store_item_views(share_id);
CREATE INDEX IF NOT EXISTS idx_store_item_views_diamond ON public.store_item_views(diamond_stock_number);
CREATE INDEX IF NOT EXISTS idx_store_item_reshares_original_share ON public.store_item_reshares(original_share_id);
