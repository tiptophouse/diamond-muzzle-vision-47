import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'Brilliantteatbot';
const B2B_GROUP_ID = Deno.env.get('B2B_GROUP_ID') || -1002178695748;

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
  bid_count?: number;
  view_count?: number;
  shared_by?: number;
  shared_by_name?: string;
  test_mode?: boolean;
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
      bid_count = 0,
      view_count = 0,
      shared_by,
      shared_by_name,
      test_mode = false,
    } = payload;

    // Use B2B group or test chat
    const chat_id = providedChatId || (test_mode && shared_by ? shared_by : B2B_GROUP_ID);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    const telegramBotUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
    const endsAtDate = new Date(ends_at);
    const diffMs = endsAtDate.getTime() - Date.now();
    const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeText = '';
    if (hoursRemaining > 24) {
      const days = Math.floor(hoursRemaining / 24);
      timeText = `${days} ימים ${hoursRemaining % 24} שעות`;
    } else {
      timeText = `${hoursRemaining} שעות ${minutesRemaining} דקות`;
    }

    const sharerText = shared_by_name ? `\n\n🎯 *מי משתף:* ${shared_by_name}` : '';

    // Message text
    const messageText = `
🔨 *מכרז חי - Live Auction*

💎 *${diamond_description}*
📦 מלאי: \`${stock_number}\`

💰 *מחיר נוכחי: ${current_price.toLocaleString()} ${currency}*
📈 הצעה הבאה: ${(current_price + min_increment).toLocaleString()} ${currency}
⏰ זמן נותר: ${timeText}

📊 *סטטיסטיקה:*
• 👥 ${bid_count} הצעות
• 👁️ ${view_count} צפיות${sharerText}

הצטרף למכרז עכשיו! 👇
`.trim();

    // Inline keyboard with deep links
    const inlineKeyboard = [
      [
        {
          text: `💰 הצע ${(current_price + min_increment).toLocaleString()} ${currency}`,
          url: `${telegramBotUrl}?startapp=auction_${auction_id}`,
        },
      ],
      [
        {
          text: '👀 צפה ביהלום',
          url: `${telegramBotUrl}?startapp=diamond_${stock_number}`,
        },
        {
          text: '📈 כל ההצעות',
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

    // Track analytics if shared_by is provided
    if (shared_by) {
      await supabase.from('auction_analytics').insert({
        auction_id,
        telegram_id: shared_by,
        event_type: 'share',
        event_data: {
          target_chat_id: chat_id,
          message_id: result.result.message_id,
          test_mode,
        },
      });
      console.log('✅ Share analytics tracked');
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
