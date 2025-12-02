import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'Brilliantteatbot';
const TEST_GROUP_ID = -1002178695748; // Test group ID
const WEBAPP_URL = 'https://mazalbot.app';

interface AuctionMessagePayload {
  chat_id?: string | number;
  auction_id: string;
  stock_number: string;
  current_price: number;
  min_increment: number;
  currency: string;
  ends_at: string;
  image_url?: string;
  seller_telegram_id: number;
  seller_username?: string;
  diamond: {
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cut: string;
    stock_number: string;
    price_per_carat?: number;
    picture?: string;
  };
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
      seller_telegram_id,
      seller_username,
      diamond,
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

    console.log('📤 Generating AI auction message for diamond:', diamond.stock_number);

    // Calculate time remaining
    const endsAtDate = new Date(ends_at);
    const timeRemaining = Math.floor((endsAtDate.getTime() - Date.now()) / (1000 * 60 * 60));

    // Generate AI message for auction
    console.log('🤖 Generating AI auction message...');
    const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-auction-message', {
      body: {
        diamond: {
          shape: diamond.shape,
          weight: diamond.weight,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          stock_number: diamond.stock_number,
          price_per_carat: diamond.price_per_carat,
        },
        start_price: current_price,
        min_increment,
        hours_remaining: timeRemaining,
      }
    });

    // Use AI message or fallback
    const auctionMessage = aiData?.message || `🔨 מכרז פעיל - יהלום יוקרתי!

💎 ${diamond.weight}ct ${diamond.shape}
🎨 ${diamond.color} צבע • ${diamond.clarity} ניקיון • ${diamond.cut} חיתוך

💰 מחיר נוכחי: $${current_price.toLocaleString()}
📈 הצעה הבאה: +$${min_increment}
⏰ נגמר בעוד: ${timeRemaining} שעות`;

    console.log('📤 Sending auction message to Telegram group:', chat_id);

    // Build inline keyboard with web_app buttons
    const inline_keyboard = [
      [
        {
          text: `💰 הצע +$${min_increment}`,
          web_app: { url: `${WEBAPP_URL}/auction/${auction_id}?action=bid` }
        }
      ],
      [
        {
          text: '📞 דבר עם המוכר',
          url: seller_username 
            ? `https://t.me/${seller_username}`
            : `tg://user?id=${seller_telegram_id}`
        }
      ]
    ];

    // Send photo with caption and inline buttons
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: Number(chat_id),
        photo: diamond.picture || image_url || 'https://via.placeholder.com/400?text=Diamond',
        caption: auctionMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard
        }
      })
    });

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramData.ok) {
      console.error('❌ Telegram API error:', telegramData);
      throw new Error(telegramData.description || 'Failed to send message to Telegram');
    }

    const message_id = telegramData.result.message_id;
    console.log('✅ Auction message sent successfully, message_id:', message_id);

    return new Response(
      JSON.stringify({
        success: true,
        message_id,
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
