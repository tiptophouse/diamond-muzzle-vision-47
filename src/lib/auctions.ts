import { supabase } from '@/integrations/supabase/client';
import type { AuctionSchema, AuctionBidSchema, AuctionCreateRequest } from '@/types/fastapi-models';

export async function createAuction(
  request: AuctionCreateRequest & { seller_telegram_id: number }
): Promise<AuctionSchema> {
  console.log('🔍 Creating auction for:', {
    stock_number: request.stock_number,
    seller_telegram_id: request.seller_telegram_id
  });

  // STEP 1: Verify diamond exists in inventory
  const { data: inventoryCheck, error: checkError } = await supabase
    .from('inventory')
    .select('stock_number, user_id, deleted_at')
    .eq('stock_number', request.stock_number)
    .eq('user_id', request.seller_telegram_id)
    .is('deleted_at', null)
    .single();

  if (checkError || !inventoryCheck) {
    console.error('❌ Diamond not found in inventory:', {
      stock_number: request.stock_number,
      user_id: request.seller_telegram_id,
      error: checkError
    });
    throw new Error(`Diamond ${request.stock_number} not found in your inventory. Please ensure it exists and is not deleted.`);
  }

  console.log('✅ Diamond verified in inventory:', inventoryCheck);

  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + request.duration_hours);

  // STEP 2: Set user context before inserting (fixes RLS bug)
  const { error: contextError } = await supabase.rpc('set_user_context', {
    telegram_id: request.seller_telegram_id
  });

  if (contextError) {
    console.error('❌ Failed to set user context:', contextError);
    throw new Error('Authentication error. Please try again.');
  }

  console.log('✅ User context set successfully');

  // STEP 3: Insert auction
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
    console.error('❌ Failed to create auction:', {
      error,
      code: error.code,
      message: error.message,
      details: error.details
    });
    throw new Error(`Failed to create auction: ${error.message}`);
  }
  
  console.log('✅ Auction created successfully:', data);
  return data as any;
}

export async function getAuctionById(auctionId: string) {
  const { data: auction, error } = await supabase
    .from('auctions' as any)
    .select('*')
    .eq('id', auctionId)
    .single();

  if (error) throw error;

  // Get diamond separately
  const { data: diamond } = await supabase
    .from('inventory' as any)
    .select('*')
    .eq('stock_number', (auction as any).stock_number)
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
