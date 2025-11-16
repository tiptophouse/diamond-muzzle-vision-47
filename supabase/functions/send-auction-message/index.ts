import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { fetchDiamondFromFastAPI } from '../_shared/fastapi-client.ts';
import { buildAuctionMessage, buildEnhancedInlineKeyboard } from '../_shared/auction-message-builder.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      diamond_description,
      current_price,
      min_increment,
      currency,
      ends_at,
      image_url,
    } = payload;

    // Use test group as default if no chat_id provided
    const chat_id = providedChatId || TEST_GROUP_ID;

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Fetch auction data from Supabase
    const { data: auctionData, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auction_id)
      .single();

    if (auctionError || !auctionData) {
      throw new Error(`Failed to fetch auction: ${auctionError?.message}`);
    }

    // Fetch fresh diamond data from FastAPI
    console.log(`📡 Fetching diamond ${stock_number} from FastAPI`);
    const diamond = await fetchDiamondFromFastAPI(stock_number, auctionData.seller_telegram_id);

    // Use image from FastAPI if available, otherwise use provided image_url
    const actualImageUrl = diamond?.picture || image_url;

    // Build rich auction message
    const messageText = buildAuctionMessage(
      diamond,
      {
        id: auction_id,
        stock_number,
        current_price,
        min_increment,
        currency,
        ends_at,
        bid_count: 0,
        reserve_price: auctionData.reserve_price,
        seller_telegram_id: auctionData.seller_telegram_id,
      },
      TELEGRAM_BOT_USERNAME
    );

    // Build enhanced inline keyboard
    const inlineKeyboard = buildEnhancedInlineKeyboard(
      auction_id,
      stock_number,
      current_price + min_increment,
      currency,
      TELEGRAM_BOT_USERNAME
    );

    // Send message with photo if available
    const telegramApiUrl = actualImageUrl
      ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`
      : `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const body = actualImageUrl
      ? {
          chat_id,
          photo: actualImageUrl,
          caption: messageText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard },
        }
      : {
          chat_id,
          text: messageText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard },
        };

    console.log('📤 Sending auction message:', {
      chat_id,
      has_image: !!actualImageUrl,
      image_source: diamond?.picture ? 'FastAPI' : 'Provided',
    });

    console.log('📤 Sending auction message to chat:', chat_id);

    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await telegramResponse.json();

    if (!result.ok) {
      console.error('❌ Telegram API error:', result);
      throw new Error(`Telegram API error: ${result.description}`);
    }

    console.log('✅ Auction message sent successfully');

    // Store message_id in auction for future updates
    try {
      const messageIds = [{ 
        chat_id: result.result.chat.id, 
        message_id: result.result.message_id 
      }];
      
      await supabase
        .from('auctions')
        .update({ message_ids: messageIds })
        .eq('id', auction_id);
        
      console.log('💾 Message ID stored in auction');
    } catch (error) {
      console.error('Failed to store message_id:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: result.result.message_id,
        chat_id: result.result.chat.id,
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
