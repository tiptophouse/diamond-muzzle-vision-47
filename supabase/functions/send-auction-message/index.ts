import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { sendDiamondCard, DiamondCardData, DiamondCardOptions } from '../_shared/diamond-card-template.ts';

const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'Brilliantteatbot';
const TEST_GROUP_ID = -1002178695748; // Test group ID

interface AuctionMessagePayload {
  chat_id?: string | number;
  auction_id: string;
  stock_number: string;
  current_price: number;
  min_increment: number;
  currency: string;
  ends_at: string;
  image_url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuctionMessagePayload = await req.json();
    
    const {
      chat_id: providedChatId,
      auction_id,
      stock_number,
      current_price,
      min_increment,
      currency,
      ends_at,
      image_url,
    } = payload;

    // Use test group as default if no chat_id provided
    const chat_id = providedChatId || TEST_GROUP_ID;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📤 Fetching diamond snapshot for auction:', auction_id);

    // Fetch diamond snapshot from auction_diamonds
    const { data: diamond, error: diamondError } = await supabase
      .from('auction_diamonds')
      .select('*')
      .eq('auction_id', auction_id)
      .single();

    if (diamondError || !diamond) {
      console.error('❌ Diamond snapshot not found for auction:', auction_id);
      console.error('❌ Supabase error:', JSON.stringify(diamondError, null, 2));
      throw new Error(`Diamond snapshot not found for auction ${auction_id}: ${diamondError?.message || 'Unknown error'}`);
    }

    console.log('✅ Diamond snapshot fetched for auction');

    // Calculate time remaining
    const endsAtDate = new Date(ends_at);
    const timeRemaining = Math.floor((endsAtDate.getTime() - Date.now()) / (1000 * 60 * 60));

    // Fetch bid count
    const { data: bids, error: bidsError } = await supabase
      .from('auction_bids')
      .select('id', { count: 'exact', head: true })
      .eq('auction_id', auction_id);

    const bidCount = bidsError ? 0 : (bids || 0);

    // Fetch spectator count (active watchers in last 5 minutes)
    const { data: spectators, error: spectatorsError } = await supabase
      .from('auction_presence')
      .select('telegram_id', { count: 'exact', head: true })
      .eq('auction_id', auction_id)
      .gte('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    const spectatorCount = spectatorsError ? 0 : (spectators || 0);

    // Build DiamondCardData from snapshot
    const diamondData: DiamondCardData = {
      id: diamond.id || stock_number, // Use snapshot ID or stock_number as fallback
      stock_number: diamond.stock_number,
      shape: diamond.shape,
      weight: diamond.weight,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      price_per_carat: diamond.price_per_carat,
      picture: diamond.picture || image_url,
      gem360_url: diamond.video_url,
    };

    // Build DiamondCardOptions with auction context (WEBHOOK-FREE)
    const options: DiamondCardOptions = {
      context: 'auction',
      customMessage: `🔴 LIVE: ${spectatorCount} צופים\n\n💰 מחיר נוכחי: ${current_price} ${currency}\n📈 הצעה הבאה: ${current_price + min_increment} ${currency}\n⏰ זמן נותר: ~${timeRemaining} שעות\n🔥 ${bidCount} הצעות`,
      additionalButtons: [
        {
          text: `💰 הצע ${current_price + min_increment} ${currency}`,
          url: `https://t.me/${TELEGRAM_BOT_USERNAME}?startapp=bid_${auction_id}`,
        }
      ],
      includePrice: false, // Don't show diamond price, show auction price instead
      includeStoreButton: false, // Don't show store button in auctions
      botUsername: TELEGRAM_BOT_USERNAME,
    };

    console.log('📤 Sending auction message to chat:', chat_id);

    // Send with sendDiamondCard
    const result = await sendDiamondCard(
      Number(chat_id),
      diamondData,
      options
    );

    if (!result.success) {
      console.error('❌ Failed to send auction message to chat:', chat_id);
      console.error('❌ Telegram error:', result.error);
      throw new Error(`Failed to send auction message to chat ${chat_id}: ${result.error || 'Unknown error'}`);
    }
    
    console.log('✅ Telegram message sent with ID:', result.messageId);

    console.log('✅ Auction message sent successfully, storing message ID');

    // Store message ID in auction for multi-message updates
    const { data: existingAuction } = await supabase
      .from('auctions')
      .select('message_ids')
      .eq('id', auction_id)
      .single();

    const existingMessageIds = existingAuction?.message_ids || {};
    const updatedMessageIds = {
      ...existingMessageIds,
      [chat_id]: result.messageId,
    };

    await supabase
      .from('auctions')
      .update({ message_ids: updatedMessageIds })
      .eq('id', auction_id);

    console.log('✅ Message ID stored for multi-message updates');

    return new Response(
      JSON.stringify({
        success: true,
        message_id: result.messageId,
        chat_id: chat_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ CRITICAL ERROR sending auction message:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Request payload:', JSON.stringify({
      chat_id: 'REDACTED',
      auction_id: 'REDACTED',
      stock_number: 'REDACTED'
    }));
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        details: error?.stack || 'No stack trace',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
