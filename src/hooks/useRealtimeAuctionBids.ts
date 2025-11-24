import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeBidUpdate {
  id: string;
  auction_id: string;
  bidder_telegram_id: number;
  bidder_name: string | null;
  bid_amount: number;
  created_at: string;
}

export function useRealtimeAuctionBids(auctionId: string) {
  const [bids, setBids] = useState<RealtimeBidUpdate[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [bidCount, setBidCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastBidTime, setLastBidTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    // Fetch initial bids and auction data
    const fetchInitialData = async () => {
      try {
        // Get auction current price
        const { data: auction, error: auctionError } = await supabase
          .from('auctions')
          .select('current_price, bid_count')
          .eq('id', auctionId)
          .single();

        if (auctionError) throw auctionError;

        setCurrentPrice(auction.current_price);
        setBidCount(auction.bid_count || 0);

        // Get latest bids
        const { data: bidsData, error: bidsError } = await supabase
          .from('auction_bids')
          .select('*')
          .eq('auction_id', auctionId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (bidsError) throw bidsError;

        setBids(bidsData || []);
        if (bidsData && bidsData.length > 0) {
          setLastBidTime(new Date(bidsData[0].created_at));
        }
      } catch (error) {
        console.error('Failed to fetch auction data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to real-time bid updates
    const bidsChannel = supabase
      .channel(`auction-bids-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          console.log('🔴 New bid received:', payload.new);
          const newBid = payload.new as RealtimeBidUpdate;
          
          setBids(prev => [newBid, ...prev.slice(0, 9)]);
          setCurrentPrice(newBid.bid_amount);
          setBidCount(prev => prev + 1);
          setLastBidTime(new Date(newBid.created_at));
        }
      )
      .subscribe();

    // Subscribe to auction updates (for price changes from other sources)
    const auctionChannel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          console.log('🔴 Auction updated:', payload.new);
          const updated = payload.new as any;
          setCurrentPrice(updated.current_price);
          setBidCount(updated.bid_count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
      supabase.removeChannel(auctionChannel);
    };
  }, [auctionId]);

  return { 
    bids, 
    currentPrice, 
    bidCount, 
    isLoading,
    lastBidTime
  };
}
