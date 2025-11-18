-- Fix missing RLS on auction_watchers table
ALTER TABLE auction_watchers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to watch auctions they can view
CREATE POLICY "Users can watch auctions they can view"
ON auction_watchers
FOR INSERT
WITH CHECK (
  auction_id IN (
    SELECT id FROM auctions 
    WHERE status = 'active'
  )
  AND telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
);

CREATE POLICY "Users can view watchers of auctions"
ON auction_watchers
FOR SELECT
USING (
  auction_id IN (
    SELECT id FROM auctions 
    WHERE status = 'active' OR seller_telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  )
);

-- Fix user_behavior_analytics RLS issue - allow system to insert
CREATE POLICY "System can insert behavior analytics" 
ON user_behavior_analytics
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own behavior analytics
CREATE POLICY "Users can view their own behavior analytics"
ON user_behavior_analytics
FOR SELECT
USING (telegram_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));