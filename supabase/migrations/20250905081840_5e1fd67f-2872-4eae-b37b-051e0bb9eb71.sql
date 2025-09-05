-- Fix security warning: Update function search path to be immutable
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
SET search_path TO 'public'
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