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

  const snapshot = request.diamond_snapshot;
  console.log('💎 Using provided diamond snapshot:', snapshot.stock_number);

  // Create auction with diamond snapshot in single atomic RPC call
  console.log('📡 Creating auction with diamond snapshot (atomic transaction)...');
  const { data, error } = await (supabase as any).rpc('create_auction_with_context', {
    // Auction parameters
    p_stock_number: request.stock_number,
    p_starting_price: request.starting_price,
    p_min_increment: request.min_increment,
    p_currency: request.currency || 'USD',
    p_ends_at: endsAt.toISOString(),
    p_seller_telegram_id: request.seller_telegram_id,
    
    // Diamond snapshot parameters
    p_diamond_shape: snapshot.shape,
    p_diamond_weight: snapshot.weight,
    p_diamond_color: snapshot.color,
    p_diamond_clarity: snapshot.clarity,
    p_diamond_cut: snapshot.cut,
    p_diamond_polish: snapshot.polish,
    p_diamond_symmetry: snapshot.symmetry,
    p_diamond_fluorescence: snapshot.fluorescence,
    p_diamond_measurements: snapshot.measurements,
    p_diamond_table_percentage: snapshot.table_percentage,
    p_diamond_depth_percentage: snapshot.depth_percentage,
    p_diamond_certificate_number: snapshot.certificate_number,
    p_diamond_lab: snapshot.lab,
    p_diamond_picture: snapshot.picture,
    p_diamond_certificate_url: snapshot.certificate_url,
    p_diamond_video_url: snapshot.video_url,
    p_diamond_price_per_carat: snapshot.price_per_carat,
    p_diamond_total_price: snapshot.total_price || (snapshot.price_per_carat || 0) * snapshot.weight,
  });

  if (error) {
    console.error('❌ Failed to create auction with diamond snapshot:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Auction creation failed: ${error.message}`);
  }
  
  if (!data) {
    console.error('❌ No auction data returned from RPC');
    throw new Error('No auction data returned');
  }
  
  console.log('✅ Auction created successfully with diamond snapshot (atomic)');
  console.log('📊 Auction details:', data);
  
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
