import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

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

    const telegramBotUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
    const endsAtDate = new Date(ends_at);
    const timeRemaining = Math.floor((endsAtDate.getTime() - Date.now()) / (1000 * 60 * 60));

    // Message text
    const messageText = `
🔨 *מכרז פעיל*

💎 ${diamond_description}
📦 מלאי: ${stock_number}

💰 *מחיר נוכחי: ${current_price} ${currency}*
📈 הצעה הבאה: ${current_price + min_increment} ${currency}
⏰ זמן נותר: ~${timeRemaining} שעות

הצטרף למכרז עכשיו! 👇
`.trim();

    // Inline keyboard with deep links
    const inlineKeyboard = [
      [
        {
          text: `💰 הצע ${current_price + min_increment} ${currency}`,
          callback_data: `bid:${auction_id}`,
        },
      ],
      [
        {
          text: '👀 צפה ביהלום',
          url: `${telegramBotUrl}?startapp=diamond_${stock_number}`,
        },
        {
          text: '📈 צפה בהצעות',
          url: `${telegramBotUrl}?startapp=auction_${auction_id}`,
        },
      ],
    ];

    // Send message with photo if available
    const telegramApiUrl = image_url
      ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`
      : `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const body = image_url
      ? {
          chat_id,
          photo: image_url,
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
