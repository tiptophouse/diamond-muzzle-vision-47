import { useState, useEffect } from 'react';
import { listAuctions } from '@/api/auctions';
import type { FastAPIAuctionSchema } from '@/types/fastapi-models';

export interface AuctionWithDiamond {
  id: number;  // Changed from string to number
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

// Transform FastAPI response to UI format
function transformAuction(auction: FastAPIAuctionSchema): AuctionWithDiamond {
  const d = auction.auction_diamond;
  return {
    id: auction.id,
    stock_number: d?.stock || `Auction-${auction.id}`,
    starting_price: auction.start_price,
    current_price: auction.current_price,
    min_increment: auction.min_increment,
    currency: 'USD',
    status: auction.state === 'scheduled' || auction.state === 'active' ? 'active' : auction.state,
    starts_at: auction.start_time,
    ends_at: auction.end_time,
    seller_telegram_id: 0, // FastAPI doesn't return this yet
    bid_count: 0, // Will be populated via real-time
    diamond: d ? {
      stock_number: d.stock,
      shape: d.shape,
      weight: d.weight,
      color: d.color,
      clarity: d.clarity,
      cut: d.cut || undefined,
      picture: d.picture || undefined,
      certificate_number: d.certificate_number,
      lab: d.lab,
    } : null,
  };
}

export function useAuctionsData() {
  const [auctions, setAuctions] = useState<AuctionWithDiamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from FastAPI - each auction has its own diamond embedded!
      const data = await listAuctions();
      const transformed = data.map(transformAuction);
      
      setAuctions(transformed);
    } catch (err) {
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
