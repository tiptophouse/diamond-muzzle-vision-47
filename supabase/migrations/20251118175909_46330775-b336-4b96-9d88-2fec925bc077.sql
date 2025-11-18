-- Enable Realtime for auction analytics tables
-- This allows live updates for auction views, bids, and auction data

-- Enable replica identity for auction_analytics
ALTER TABLE auction_analytics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_analytics;

-- Enable replica identity for auction_bids
ALTER TABLE auction_bids REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_bids;

-- Enable replica identity for auctions
ALTER TABLE auctions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;

-- Enable replica identity for diamond_share_analytics
ALTER TABLE diamond_share_analytics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE diamond_share_analytics;