import { supabase } from '@/integrations/supabase/client';
import type { AuctionSchema, AuctionBidSchema, AuctionCreateRequest } from '@/types/fastapi-models';

export async function createAuction(
  request: AuctionCreateRequest & { seller_telegram_id: number }
): Promise<AuctionSchema> {
  console.log('🔵 createAuction STARTED with:', request);
  
  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + request.duration_hours);

  console.log('📡 Setting user context for RLS...');
  // Set user context for RLS
  const { error: contextError } = await supabase.rpc('set_user_context', {
    telegram_id: request.seller_telegram_id
  });

  if (contextError) {
    console.error('❌ Failed to set user context:', contextError);
    throw new Error(`Auth context failed: ${contextError.message}`);
  }
  console.log('✅ User context set');

  // First, get the diamond details to store snapshot
  console.log('📡 Fetching diamond from inventory...');
  const { data: diamond, error: fetchError } = await supabase
    .from('inventory' as any)
    .select('*')
    .eq('stock_number', request.stock_number)
    .eq('user_id', request.seller_telegram_id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !diamond) {
    console.error('❌ Diamond not found:', fetchError);
    throw new Error('Diamond not found in your inventory');
  }
  
  const diamondRecord = diamond as any;
  console.log('✅ Diamond found:', diamondRecord.stock_number);

  // Create auction
  console.log('📡 Creating auction record...');
  const { data, error } = await (supabase as any)
    .from('auctions')
    .insert([{
      stock_number: request.stock_number,
      starting_price: request.starting_price,
      current_price: request.starting_price,
      min_increment: request.min_increment,
      currency: request.currency || 'USD',
      ends_at: endsAt.toISOString(),
      seller_telegram_id: request.seller_telegram_id,
    }] as any)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create auction:', error);
    throw new Error(`Auction creation failed: ${error.message}`);
  }
  console.log('✅ Auction record created:', data.id);

  // Store diamond snapshot
  const { error: diamondError } = await supabase
    .from('auction_diamonds' as any)
    .insert({
      auction_id: data.id,
      stock_number: diamondRecord.stock_number,
      shape: diamondRecord.shape,
      weight: diamondRecord.weight,
      color: diamondRecord.color,
      clarity: diamondRecord.clarity,
      cut: diamondRecord.cut,
      polish: diamondRecord.polish,
      symmetry: diamondRecord.symmetry,
      fluorescence: diamondRecord.fluorescence,
      measurements: diamondRecord.measurements,
      table_percentage: diamondRecord.table_percentage,
      depth_percentage: diamondRecord.depth_percentage,
      certificate_number: diamondRecord.certificate_number,
      lab: diamondRecord.lab,
      picture: diamondRecord.picture,
      certificate_url: diamondRecord.certificate_url,
      video_url: diamondRecord.video_url,
      price_per_carat: diamondRecord.price_per_carat,
      total_price: diamondRecord.price_per_carat * diamondRecord.weight,
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
