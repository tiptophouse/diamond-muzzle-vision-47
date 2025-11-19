-- Create comprehensive auth debug logs table
CREATE TABLE IF NOT EXISTS public.auth_debug_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT,
  event_type TEXT NOT NULL, -- 'attempt', 'success', 'failure', 'error', 'token_refresh'
  event_data JSONB, -- Store detailed event information
  init_data_present BOOLEAN,
  init_data_length INTEGER,
  has_valid_token BOOLEAN,
  error_message TEXT,
  error_stack TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying logs by telegram_id and timestamp
CREATE INDEX idx_auth_debug_logs_telegram_id ON public.auth_debug_logs(telegram_id);
CREATE INDEX idx_auth_debug_logs_timestamp ON public.auth_debug_logs(timestamp DESC);
CREATE INDEX idx_auth_debug_logs_event_type ON public.auth_debug_logs(event_type);

-- Enable RLS
ALTER TABLE public.auth_debug_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs
CREATE POLICY "Users can view own auth logs"
  ON public.auth_debug_logs
  FOR SELECT
  USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

-- Allow admins to view all logs
CREATE POLICY "Admins can view all auth logs"
  ON public.auth_debug_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
      AND is_active = true
    )
  );

-- Allow system to insert logs (using service role)
CREATE POLICY "System can insert auth logs"
  ON public.auth_debug_logs
  FOR INSERT
  WITH CHECK (true);