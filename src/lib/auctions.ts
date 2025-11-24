import { supabase } from '@/integrations/supabase/client';
import type { AuctionSchema, AuctionBidSchema, AuctionCreateRequest } from '@/types/fastapi-models';

export interface DiamondSnapshot {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  measurements?: string;
  table_percentage?: number;
  depth_percentage?: number;
  certificate_number?: number;
  lab?: string;
  picture?: string;
  certificate_url?: string;
  video_url?: string;
  price_per_carat?: number;
  total_price?: number;
}

export async function createAuction(
  request: AuctionCreateRequest & { 
    seller_telegram_id: number;
    diamond_snapshot: DiamondSnapshot;
  }
): Promise<AuctionSchema> {
  console.log('🔵 createAuction STARTED with:', request);
  
  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + request.duration_hours);

  console.log('💎 Using provided diamond snapshot:', request.diamond_snapshot.stock_number);

  // Create auction using atomic RPC function (handles context + insert in one transaction)
  console.log('📡 Creating auction record with context...');
  const { data, error } = await supabase.rpc('create_auction_with_context', {
    p_stock_number: request.stock_number,
    p_starting_price: request.starting_price,
    p_min_increment: request.min_increment,
    p_currency: request.currency || 'USD',
    p_ends_at: endsAt.toISOString(),
    p_seller_telegram_id: request.seller_telegram_id
  });

  if (error) {
    console.error('❌ Failed to create auction:', error);
    throw new Error(`Auction creation failed: ${error.message}`);
  }
  console.log('✅ Auction record created:', data.id);

  // Store diamond snapshot (passed from frontend)
  const snapshot = request.diamond_snapshot;
  const { error: diamondError } = await supabase
    .from('auction_diamonds' as any)
    .insert({
      auction_id: data.id,
      stock_number: snapshot.stock_number,
      shape: snapshot.shape,
      weight: snapshot.weight,
      color: snapshot.color,
      clarity: snapshot.clarity,
      cut: snapshot.cut,
      polish: snapshot.polish,
      symmetry: snapshot.symmetry,
      fluorescence: snapshot.fluorescence,
      measurements: snapshot.measurements,
      table_percentage: snapshot.table_percentage,
      depth_percentage: snapshot.depth_percentage,
      certificate_number: snapshot.certificate_number,
      lab: snapshot.lab,
      picture: snapshot.picture,
      certificate_url: snapshot.certificate_url,
      video_url: snapshot.video_url,
      price_per_carat: snapshot.price_per_carat,
      total_price: snapshot.total_price || (snapshot.price_per_carat || 0) * snapshot.weight,
    });

  if (diamondError) {
    console.error('⚠️ Failed to store diamond snapshot:', diamondError);
  }
  
  console.log('✅ Auction created successfully with diamond snapshot:', data);
  return data as any;
}

export async function getAuctionById(auctionId: string) {
  const { data: auction, error } = await supabase
    .from('auctions' as any)
    .select('*')
    .eq('id', auctionId)
    .single();

  if (error) throw error;

  // Get diamond from auction_diamonds snapshot
  const { data: diamond } = await supabase
    .from('auction_diamonds' as any)
    .select('*')
    .eq('auction_id', auctionId)
    .single();

  // Get bids
  const { data: bids } = await supabase
    .from('auction_bids' as any)
    .select('*')
    .eq('auction_id', auctionId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    ...(auction as any),
    diamond: diamond || null,
    bids: bids || [],
    bid_count: bids?.length || 0,
  };
}

export async function placeBid(auctionId: string, bidAmount?: number) {
  // Get auction first
  const { data: auction } = await supabase
    .from('auctions' as any)
    .select('current_price, min_increment')
    .eq('id', auctionId)
    .single();

  if (!auction) throw new Error('Auction not found');

  const nextBid = bidAmount || (auction as any).current_price + (auction as any).min_increment;

  // Insert bid
  const { data: bid, error: bidError } = await supabase
    .from('auction_bids' as any)
    .insert([{
      auction_id: auctionId,
      bid_amount: nextBid,
    }] as any)
    .select()
    .single();

  if (bidError) throw bidError;

  // Update auction current price
  const { error: updateError } = await supabase
    .from('auctions' as any)
    .update({ current_price: nextBid } as any)
    .eq('id', auctionId);

  if (updateError) throw updateError;

  return bid as any;
}
