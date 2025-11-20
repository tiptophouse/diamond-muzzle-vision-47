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
      console.error('❌ Diamond snapshot not found:', diamondError);
      throw new Error('Diamond snapshot not found for auction');
    }

    console.log('✅ Diamond snapshot fetched for auction');

    // Calculate time remaining
    const endsAtDate = new Date(ends_at);
    const timeRemaining = Math.floor((endsAtDate.getTime() - Date.now()) / (1000 * 60 * 60));

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

    // Build DiamondCardOptions with auction context
    const options: DiamondCardOptions = {
      context: 'auction',
      customMessage: `💰 מחיר נוכחי: ${current_price} ${currency}\n📈 הצעה הבאה: ${current_price + min_increment} ${currency}\n⏰ זמן נותר: ~${timeRemaining} שעות\n🔥 0 הצעות`,
      additionalButtons: [
        {
          text: `💰 הצע ${current_price + min_increment} ${currency}`,
          callback_data: `bid:${auction_id}`,
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
      console.error('❌ Failed to send auction message:', result.error);
      throw new Error(result.error || 'Failed to send auction message');
    }

    console.log('✅ Auction message sent successfully');

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
    console.error('❌ Error sending auction message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
