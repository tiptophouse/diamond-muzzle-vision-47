-- Enable real-time updates for bot analytics tables
ALTER TABLE public.chatbot_messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.group_cta_clicks REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_cta_clicks;

-- Create bot_usage_analytics table for real-time tracking
CREATE TABLE public.bot_usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  bot_token_type TEXT NOT NULL DEFAULT 'main', -- 'main', 'clients', 'sellers'
  command TEXT,
  message_type TEXT NOT NULL, -- 'command', 'text', 'callback', 'inline_query'
  chat_type TEXT NOT NULL DEFAULT 'private', -- 'private', 'group', 'supergroup'
  chat_id BIGINT NOT NULL,
  user_info JSONB DEFAULT '{}',
  message_data JSONB DEFAULT '{}',
  response_sent BOOLEAN DEFAULT false,
  response_time_ms INTEGER,
  api_version TEXT DEFAULT '9.1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bot_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view all bot usage analytics" 
ON public.bot_usage_analytics 
FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "System can insert bot usage analytics" 
ON public.bot_usage_analytics 
FOR INSERT 
WITH CHECK (true);

-- Add to realtime
ALTER TABLE public.bot_usage_analytics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_usage_analytics;

-- Create indexes for performance
CREATE INDEX idx_bot_usage_telegram_id ON public.bot_usage_analytics(telegram_id);
CREATE INDEX idx_bot_usage_created_at ON public.bot_usage_analytics(created_at DESC);
CREATE INDEX idx_bot_usage_bot_type ON public.bot_usage_analytics(bot_token_type);
CREATE INDEX idx_bot_usage_message_type ON public.bot_usage_analytics(message_type);

-- Create function for bot analytics summary
CREATE OR REPLACE FUNCTION public.get_bot_usage_summary()
RETURNS TABLE(
  total_messages_today BIGINT,
  unique_users_today BIGINT,
  commands_used_today BIGINT,
  avg_response_time_ms NUMERIC,
  most_used_commands JSONB,
  active_chats BIGINT,
  bot_distribution JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.bot_usage_analytics WHERE created_at >= CURRENT_DATE)::BIGINT,
    (SELECT COUNT(DISTINCT telegram_id) FROM public.bot_usage_analytics WHERE created_at >= CURRENT_DATE)::BIGINT,
    (SELECT COUNT(*) FROM public.bot_usage_analytics WHERE message_type = 'command' AND created_at >= CURRENT_DATE)::BIGINT,
    (SELECT COALESCE(AVG(response_time_ms), 0) FROM public.bot_usage_analytics WHERE response_time_ms IS NOT NULL AND created_at >= CURRENT_DATE)::NUMERIC,
    (SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('command', command, 'count', command_count)
        ORDER BY command_count DESC
      ), 
      '[]'::jsonb
    ) FROM (
      SELECT command, COUNT(*) as command_count 
      FROM public.bot_usage_analytics 
      WHERE command IS NOT NULL AND created_at >= CURRENT_DATE 
      GROUP BY command 
      LIMIT 10
    ) t)::JSONB,
    (SELECT COUNT(DISTINCT chat_id) FROM public.bot_usage_analytics WHERE created_at >= CURRENT_DATE)::BIGINT,
    (SELECT COALESCE(
      jsonb_object_agg(bot_token_type, bot_count), 
      '{}'::jsonb
    ) FROM (
      SELECT bot_token_type, COUNT(*) as bot_count 
      FROM public.bot_usage_analytics 
      WHERE created_at >= CURRENT_DATE 
      GROUP BY bot_token_type
    ) b)::JSONB;
END;
$function$;