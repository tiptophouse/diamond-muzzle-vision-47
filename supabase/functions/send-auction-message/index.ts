import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { sendDiamondCard, DiamondCardData, DiamondCardOptions } from '../_shared/diamond-card-template.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'Brilliantteatbot';
const TEST_GROUP_ID = -1002178695748; // Test group ID

interface AuctionMessagePayload {
  chat_id?: string | number;
  auction_id: string;
  stock_number: string;
  diamond_description: string;
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
    } = payload;

    // Use test group as default if no chat_id provided
    const chat_id = providedChatId || TEST_GROUP_ID;

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📦 Fetching diamond data for stock:', stock_number);

    // Fetch full diamond data from inventory
    const { data: diamond, error: diamondError } = await supabase
      .from('inventory')
      .select('*')
      .eq('stock_number', stock_number)
      .single();

    if (diamondError || !diamond) {
      console.error('❌ Diamond not found:', diamondError);
      throw new Error('Diamond not found in inventory');
    }

    console.log('💎 Diamond found:', diamond.stock_number);

    // Build DiamondCardData
    const diamondData: DiamondCardData = {
      stockNumber: diamond.stock_number,
      shape: diamond.shape,
      weight: diamond.weight,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      polish: diamond.polish,
      symmetry: diamond.symmetry,
      fluorescence: diamond.fluorescence,
      pricePerCarat: diamond.price_per_carat,
      lab: diamond.lab,
      certificateNumber: diamond.certificate_number,
      certificateUrl: diamond.certificate_url,
      picture: diamond.picture,
      videoUrl: diamond.video_url,
      gem360Url: diamond.gem360_url,
    };

    // Calculate time remaining
    const endsAtDate = new Date(ends_at);
    const timeRemaining = Math.floor((endsAtDate.getTime() - Date.now()) / (1000 * 60 * 60));

    // Build auction context message
    const auctionContext = `🔨 *מכרז פעיל*

💰 מחיר נוכחי: ${current_price} ${currency}
📈 הצעה הבאה: ${current_price + min_increment} ${currency}
⏰ זמן נותר: ~${timeRemaining} שעות
🔥 0 הצעות`;

    // Build DiamondCardOptions with auction context
    const options: DiamondCardOptions = {
      context: 'auction',
      customMessage: auctionContext,
      additionalButtons: [[
        {
          text: `💰 הצע ${current_price + min_increment} ${currency}`,
          callback_data: `bid:${auction_id}`,
        }
      ]],
      includePrice: false,
      includeStoreButton: false,
    };

    console.log('📤 Sending auction message to chat:', chat_id);

    // Send diamond card
    const result = await sendDiamondCard(
      Number(chat_id),
      diamondData,
      options
    );

    if (!result.success) {
      console.error('❌ Failed to send auction message:', result.error);
      throw new Error(result.error || 'Failed to send auction message');
    }

    console.log('✅ Auction message sent successfully, message_id:', result.messageId);

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
