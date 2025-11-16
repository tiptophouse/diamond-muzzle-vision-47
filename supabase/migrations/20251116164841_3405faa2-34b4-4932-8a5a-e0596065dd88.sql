-- Add auction_watchers table for notification subscriptions
CREATE TABLE IF NOT EXISTS public.auction_watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(auction_id, telegram_id)
);

CREATE INDEX idx_auction_watchers_auction ON public.auction_watchers(auction_id);
CREATE INDEX idx_auction_watchers_telegram ON public.auction_watchers(telegram_id);

-- Enhanced auction analytics function with all event types
CREATE OR REPLACE FUNCTION public.get_auction_stats(auction_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COUNT(*) FILTER (WHERE event_type = 'view'),
    'total_clicks', COUNT(*) FILTER (WHERE event_type = 'click'),
    'unique_viewers', COUNT(DISTINCT telegram_id) FILTER (WHERE event_type IN ('view', 'click')),
    'bid_attempts', COUNT(*) FILTER (WHERE event_type = 'bid_attempt'),
    'successful_bids', COUNT(*) FILTER (WHERE event_type = 'bid_success'),
    'failed_bids', COUNT(*) FILTER (WHERE event_type = 'bid_failed'),
    'unique_bidders', COUNT(DISTINCT telegram_id) FILTER (WHERE event_type = 'bid_success'),
    'shares', COUNT(*) FILTER (WHERE event_type = 'share'),
    'story_views', COUNT(*) FILTER (WHERE event_type = 'story_view'),
    'notification_subscribers', COUNT(*) FILTER (WHERE event_type = 'notification_subscribed'),
    'conversion_rate', 
      CASE 
        WHEN COUNT(*) FILTER (WHERE event_type = 'view') > 0 
        THEN ROUND((COUNT(*) FILTER (WHERE event_type = 'bid_success')::NUMERIC / 
                    COUNT(*) FILTER (WHERE event_type = 'view') * 100), 2)
        ELSE 0 
      END,
    'avg_bids_per_user',
      CASE 
        WHEN COUNT(DISTINCT telegram_id) FILTER (WHERE event_type = 'bid_success') > 0 
        THEN ROUND(COUNT(*) FILTER (WHERE event_type = 'bid_success')::NUMERIC / 
                   COUNT(DISTINCT telegram_id) FILTER (WHERE event_type = 'bid_success'), 2)
        ELSE 0 
      END,
    'engagement_rate',
      CASE 
        WHEN COUNT(DISTINCT telegram_id) FILTER (WHERE event_type = 'view') > 0 
        THEN ROUND((COUNT(DISTINCT telegram_id) FILTER (WHERE event_type IN ('bid_success', 'click'))::NUMERIC / 
                    COUNT(DISTINCT telegram_id) FILTER (WHERE event_type = 'view') * 100), 2)
        ELSE 0 
      END
  ) INTO result
  FROM public.auction_analytics
  WHERE auction_id = auction_id_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

COMMENT ON FUNCTION public.get_auction_stats IS 'Get comprehensive auction statistics including views, clicks, bids, and conversion metrics';
COMMENT ON TABLE public.auction_watchers IS 'Users subscribed to auction notifications';
