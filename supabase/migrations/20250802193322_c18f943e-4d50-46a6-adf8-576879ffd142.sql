
-- Create user_feedback table for the feedback system
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id bigint NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('feature_usage', 'user_satisfaction', 'bug_report', 'suggestion', 'rating', 'interaction')),
  category text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create RLS policies
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON user_feedback
  FOR INSERT WITH CHECK (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" ON user_feedback
  FOR SELECT USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Admin can view all feedback
CREATE POLICY "Admin can view all feedback" ON user_feedback
  FOR ALL USING (is_current_user_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_telegram_id ON user_feedback(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON user_feedback(category);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);
