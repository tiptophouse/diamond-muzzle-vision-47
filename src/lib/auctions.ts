import { supabase } from '@/integrations/supabase/client';
import type { AuctionSchema, AuctionBidSchema, AuctionCreateRequest } from '@/types/fastapi-models';

export async function createAuction(request: AuctionCreateRequest): Promise<AuctionSchema> {
  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + request.duration_hours);

  const { data, error } = await supabase
    .from('auctions')
    .insert([{
      stock_number: request.stock_number,
      starting_price: request.starting_price,
      current_price: request.starting_price,
      min_increment: request.min_increment,
      currency: request.currency || 'USD',
      ends_at: endsAt.toISOString(),
    }] as any)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

export async function getAuctionById(auctionId: string) {
  const { data: auction, error } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', auctionId)
    .single();

  if (error) throw error;

  // Get diamond separately
  const { data: diamond } = await supabase
    .from('inventory')
    .select('*')
    .eq('stock_number', auction.stock_number)
    .single();

  // Get bids
  const { data: bids } = await supabase
    .from('auction_bids')
    .select('*')
    .eq('auction_id', auctionId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    ...auction,
    diamond: diamond || null,
    bids: bids || [],
    bid_count: bids?.length || 0,
  };
}

export async function placeBid(auctionId: string, bidAmount?: number) {
  // Get auction first
  const { data: auction } = await supabase
    .from('auctions')
    .select('current_price, min_increment')
    .eq('id', auctionId)
    .single();

  if (!auction) throw new Error('Auction not found');

  const nextBid = bidAmount || auction.current_price + auction.min_increment;

  // Insert bid
  const { data: bid, error: bidError } = await supabase
    .from('auction_bids')
    .insert([{
      auction_id: auctionId,
      bid_amount: nextBid,
    }] as any)
    .select()
    .single();

  if (bidError) throw bidError;

  // Update auction current price
  const { error: updateError } = await supabase
    .from('auctions')
    .update({ current_price: nextBid })
    .eq('id', auctionId);

  if (updateError) throw updateError;

  return bid as any;
}
