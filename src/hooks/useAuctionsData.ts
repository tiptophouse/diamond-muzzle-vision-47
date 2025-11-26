import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuctionWithDiamond {
  id: string;
  stock_number: string;
  starting_price: number;
  current_price: number;
  min_increment: number;
  currency: string;
  status: string;
  starts_at: string;
  ends_at: string;
  seller_telegram_id: number;
  bid_count: number;
  diamond: {
    stock_number: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cut?: string;
    picture?: string;
    certificate_number?: number;
    lab?: string;
  } | null;
}

export function useAuctionsData() {
  const [auctions, setAuctions] = useState<AuctionWithDiamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Fetching active auctions...');

      // Fetch active auctions
      const { data: auctionsData, error: auctionsError } = await (supabase as any)
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (auctionsError) {
        console.error('❌ Error fetching auctions:', auctionsError);
        throw auctionsError;
      }

      console.log(`✅ Found ${auctionsData?.length || 0} active auctions`);

      // Fetch auction IDs for diamonds and bids
      const auctionIds = auctionsData?.map((a: any) => a.id) || [];
      
      if (auctionIds.length === 0) {
        console.warn('⚠️ No active auctions found');
        setAuctions([]);
        setLoading(false);
        return;
      }
      
      // Fetch diamond snapshots from auction_diamonds table
      const { data: diamondsData, error: diamondsError } = await (supabase as any)
        .from('auction_diamonds')
        .select('auction_id, stock_number, shape, weight, color, clarity, cut, picture, certificate_number, lab')
        .in('auction_id', auctionIds);

      if (diamondsError) {
        console.error('❌ Error fetching diamonds:', diamondsError);
      }

      console.log(`💎 Found ${diamondsData?.length || 0} diamond snapshots`);

      // Fetch bid counts
      const { data: bidsData, error: bidsError } = await (supabase as any)
        .from('auction_bids')
        .select('auction_id')
        .in('auction_id', auctionIds);

      if (bidsError) {
        console.error('❌ Error fetching bids:', bidsError);
      }

      console.log(`📊 Found ${bidsData?.length || 0} bids`);

      // Map bid counts
      const bidCounts: Record<string, number> = {};
      bidsData?.forEach((bid: any) => {
        bidCounts[bid.auction_id] = (bidCounts[bid.auction_id] || 0) + 1;
      });

      // Combine data
      const diamondsMap = new Map(
        diamondsData?.map((d: any) => [d.auction_id, d]) || []
      );

      const enrichedAuctions: AuctionWithDiamond[] = auctionsData?.map((auction: any) => ({
        ...auction,
        diamond: diamondsMap.get(auction.id) || null,
        bid_count: bidCounts[auction.id] || 0,
      })) || [];

      console.log('🎯 Final auctions with diamonds:', {
        total: enrichedAuctions.length,
        withDiamonds: enrichedAuctions.filter(a => a.diamond).length,
        withoutDiamonds: enrichedAuctions.filter(a => !a.diamond).length
      });

      setAuctions(enrichedAuctions);
    } catch (err) {
      console.error('❌ Error fetching auctions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return { auctions, loading, error, refetch: fetchAuctions };
}
