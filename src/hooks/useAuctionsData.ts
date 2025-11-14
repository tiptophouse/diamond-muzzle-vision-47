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

      // Fetch active auctions
      const { data: auctionsData, error: auctionsError } = await (supabase as any)
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .gt('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (auctionsError) throw auctionsError;

      // Fetch stock numbers
      const stockNumbers = auctionsData?.map((a: any) => a.stock_number) || [];
      
      // Fetch diamonds for these stock numbers
      const { data: diamondsData } = await (supabase as any)
        .from('inventory')
        .select('stock_number, shape, weight, color, clarity, cut, picture, certificate_number, lab')
        .in('stock_number', stockNumbers)
        .is('deleted_at', null);

      // Fetch bid counts
      const auctionIds = auctionsData?.map((a: any) => a.id) || [];
      const { data: bidsData } = await (supabase as any)
        .from('auction_bids')
        .select('auction_id')
        .in('auction_id', auctionIds);

      // Map bid counts
      const bidCounts: Record<string, number> = {};
      bidsData?.forEach((bid: any) => {
        bidCounts[bid.auction_id] = (bidCounts[bid.auction_id] || 0) + 1;
      });

      // Combine data
      const diamondsMap = new Map(
        diamondsData?.map((d: any) => [d.stock_number, d]) || []
      );

      const enrichedAuctions: AuctionWithDiamond[] = auctionsData?.map((auction: any) => ({
        ...auction,
        diamond: diamondsMap.get(auction.stock_number) || null,
        bid_count: bidCounts[auction.id] || 0,
      })) || [];

      setAuctions(enrichedAuctions);
    } catch (err) {
      console.error('Error fetching auctions:', err);
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
