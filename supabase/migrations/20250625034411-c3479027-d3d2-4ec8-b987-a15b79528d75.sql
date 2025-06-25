
-- Update user_sessions table to capture more detailed session data
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS referrer_url TEXT,
ADD COLUMN IF NOT EXISTS entry_page TEXT,
ADD COLUMN IF NOT EXISTS exit_page TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser_info TEXT,
ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
ADD COLUMN IF NOT EXISTS time_zone TEXT;

-- Update page_visits table to capture more detailed page interaction data
ALTER TABLE public.page_visits 
ADD COLUMN IF NOT EXISTS scroll_depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS form_interactions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS feature_used TEXT,
ADD COLUMN IF NOT EXISTS interaction_data JSONB;

-- Create user_activity_log table for detailed activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT NOT NULL,
  activity_type TEXT NOT NULL, -- 'page_visit', 'diamond_add', 'diamond_edit', 'diamond_delete', 'upload', 'search', etc.
  activity_data JSONB,
  page_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id UUID REFERENCES public.user_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comprehensive user_behavior_analytics table
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT NOT NULL UNIQUE,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_sessions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  total_time_spent INTERVAL DEFAULT '0 seconds',
  diamonds_added INTEGER DEFAULT 0,
  diamonds_edited INTEGER DEFAULT 0,
  diamonds_deleted INTEGER DEFAULT 0,
  uploads_count INTEGER DEFAULT 0,
  searches_count INTEGER DEFAULT 0,
  favorite_pages JSONB DEFAULT '[]',
  device_types JSONB DEFAULT '[]',
  engagement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger to update user_behavior_analytics
CREATE OR REPLACE FUNCTION update_user_behavior_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_behavior_analytics (telegram_id, total_sessions, last_visit)
  VALUES (NEW.telegram_id, 1, NEW.session_start)
  ON CONFLICT (telegram_id) DO UPDATE SET
    total_sessions = user_behavior_analytics.total_sessions + 1,
    last_visit = NEW.session_start,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_session_analytics_trigger
  AFTER INSERT ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_behavior_analytics();

-- Enable RLS on new tables
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activity_log (users can only see their own data)
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
  FOR SELECT USING (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE id = auth.uid()));

-- Create policies for user_behavior_analytics (users can only see their own data)
CREATE POLICY "Users can view their own analytics" ON public.user_behavior_analytics
  FOR SELECT USING (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own analytics" ON public.user_behavior_analytics
  FOR UPDATE USING (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own analytics" ON public.user_behavior_analytics
  FOR INSERT WITH CHECK (telegram_id = (SELECT telegram_id FROM public.user_profiles WHERE id = auth.uid()));

-- Admin policies (admin can see all data)
CREATE POLICY "Admin can view all activity" ON public.user_activity_log
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admin can view all analytics" ON public.user_behavior_analytics
  FOR ALL USING (public.is_admin_user());
