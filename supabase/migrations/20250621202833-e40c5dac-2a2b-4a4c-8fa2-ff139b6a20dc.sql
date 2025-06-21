
-- Create enhanced user sessions tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  pages_visited INTEGER DEFAULT 0,
  total_duration INTERVAL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user analytics summary table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users,
  total_visits INTEGER DEFAULT 0,
  total_time_spent INTERVAL DEFAULT '00:00:00'::interval,
  last_active TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT DEFAULT 'free',
  api_calls_count INTEGER DEFAULT 0,
  lifetime_value NUMERIC DEFAULT 0,
  cost_per_user NUMERIC DEFAULT 0,
  revenue_per_user NUMERIC DEFAULT 0,
  profit_loss NUMERIC DEFAULT 0,
  storage_used_mb NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory analytics cache table
CREATE TABLE IF NOT EXISTS public.inventory_analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT NOT NULL,
  analytics_type TEXT NOT NULL, -- 'summary', 'color_distribution', 'clarity_breakdown', etc.
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE telegram_id = auth.uid()::text::bigint));

CREATE POLICY "Users can insert their own sessions" 
  ON public.user_sessions 
  FOR INSERT 
  WITH CHECK (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE telegram_id = auth.uid()::text::bigint));

CREATE POLICY "Users can update their own sessions" 
  ON public.user_sessions 
  FOR UPDATE 
  USING (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE telegram_id = auth.uid()::text::bigint));

-- Add RLS policies for user_analytics
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics" 
  ON public.user_analytics 
  FOR SELECT 
  USING (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE telegram_id = auth.uid()::text::bigint));

CREATE POLICY "Admin can view all analytics" 
  ON public.user_analytics 
  FOR ALL 
  USING (is_admin_user());

-- Add RLS policies for inventory_analytics_cache
ALTER TABLE public.inventory_analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cache" 
  ON public.inventory_analytics_cache 
  FOR SELECT 
  USING (user_id = (SELECT telegram_id FROM public.user_profiles WHERE telegram_id = auth.uid()::text::bigint));

CREATE POLICY "Users can manage their own cache" 
  ON public.inventory_analytics_cache 
  FOR ALL 
  USING (user_id = (SELECT telegram_id FROM public.user_profiles WHERE telegram_id = auth.uid()::text::bigint));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_id ON public.user_sessions(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_analytics_telegram_id ON public.user_analytics(telegram_id);
CREATE INDEX IF NOT EXISTS idx_inventory_cache_user_type ON public.inventory_analytics_cache(user_id, analytics_type);
CREATE INDEX IF NOT EXISTS idx_inventory_cache_expires ON public.inventory_analytics_cache(expires_at);

-- Add trigger to update user_analytics when sessions end
CREATE OR REPLACE FUNCTION update_user_analytics_on_session_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_end IS NOT NULL AND OLD.session_end IS NULL THEN
    INSERT INTO public.user_analytics (telegram_id, user_id, total_visits, total_time_spent, last_active)
    VALUES (NEW.telegram_id, NEW.user_id, 1, NEW.total_duration, NEW.session_end)
    ON CONFLICT (telegram_id) 
    DO UPDATE SET
      total_visits = user_analytics.total_visits + 1,
      total_time_spent = user_analytics.total_time_spent + NEW.total_duration,
      last_active = NEW.session_end,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_analytics
  AFTER UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analytics_on_session_end();

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.inventory_analytics_cache 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
