import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuctionGroupShareRequest {
  auctionId: string;
  stockNumber: string;
  diamondDescription: string;
  currentPrice: number;
  minIncrement: number;
  currency: string;
  endsAt: string;
  imageUrl?: string;
  bidCount: number;
  viewCount: number;
  sharedBy: number;
  sharedByName?: string;
  testMode?: boolean;
}

serve(async (req) => {
  console.log('🚀 Auction to group share function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: AuctionGroupShareRequest = await req.json();
    console.log('📥 Request data:', requestBody);
    
    const { 
      auctionId, 
      stockNumber, 
      diamondDescription, 
      currentPrice, 
      minIncrement, 
      currency, 
      endsAt,
      imageUrl,
      bidCount,
      viewCount,
      sharedBy, 
      sharedByName,
      testMode 
    } = requestBody;

    if (!auctionId || !sharedBy) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'Brilliantteatbot';
    
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine target chat
    const targetChatId = testMode ? sharedBy : (Deno.env.get('B2B_GROUP_ID') || -1002178695748);
    console.log(`📧 Sending auction to ${testMode ? 'personal chat' : 'group'}: ${targetChatId}`);

    // Get sharer name
    let sharerName = sharedByName;
    if (!sharerName) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('telegram_id', sharedBy)
        .single();
      
      if (userProfile) {
        sharerName = `${userProfile.first_name}${userProfile.last_name ? ` ${userProfile.last_name}` : ''}`;
      } else {
        sharerName = `User ${sharedBy}`;
      }
    }

    // Calculate time remaining
    const endsAtDate = new Date(endsAt);
    const now = new Date();
    const diffMs = endsAtDate.getTime() - now.getTime();
    const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeText = '';
    if (hoursRemaining > 24) {
      const days = Math.floor(hoursRemaining / 24);
      timeText = `${days} ימים ${hoursRemaining % 24} שעות`;
    } else {
      timeText = `${hoursRemaining} שעות ${minutesRemaining} דקות`;
    }

    // Process image URL
    let finalImageUrl = imageUrl;
    if (finalImageUrl) {
      if (finalImageUrl.startsWith('http://')) {
        finalImageUrl = finalImageUrl.replace('http://', 'https://');
      }
    }

    const messagePrefix = testMode ? '🧪 **TEST** - ' : '';
    const nextBidAmount = currentPrice + minIncrement;

    // Build message text
    const messageText = `${messagePrefix}🔨 *מכרז חי - Live Auction*

💎 *${diamondDescription}*
📦 מלאי: \`${stockNumber}\`

💰 *מחיר נוכחי: ${currentPrice.toLocaleString()} ${currency}*
📈 הצעה הבאה: ${nextBidAmount.toLocaleString()} ${currency}
⏰ זמן נותר: ${timeText}

📊 *סטטיסטיקה:*
• 👥 ${bidCount} הצעות
• 👁️ ${viewCount} צפיות

🎯 *מי משתף:* ${sharerName}

הצטרף למכרז עכשיו! 👇`;

    // Build inline keyboard
    const inlineKeyboard = [
      [
        {
          text: `💰 הצע ${nextBidAmount.toLocaleString()} ${currency}`,
          url: `https://t.me/${botUsername}?startapp=auction_${auctionId}`,
        },
      ],
      [
        {
          text: '👀 צפה ביהלום',
          url: `https://t.me/${botUsername}?startapp=diamond_${stockNumber}`,
        },
        {
          text: '📈 כל ההצעות',
          url: `https://t.me/${botUsername}?startapp=auction_${auctionId}`,
        },
      ],
    ];

    console.log('🖼️ Image URL:', finalImageUrl ? 'Available' : 'Not available');

    // Send to Telegram
    const telegramApiUrl = finalImageUrl
      ? `https://api.telegram.org/bot${botToken}/sendPhoto`
      : `https://api.telegram.org/bot${botToken}/sendMessage`;

    const telegramPayload = finalImageUrl
      ? {
          chat_id: targetChatId,
          photo: finalImageUrl,
          caption: messageText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard },
        }
      : {
          chat_id: targetChatId,
          text: messageText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard },
        };

    console.log('📤 Sending to Telegram...');
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telegramPayload),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error('❌ Telegram error:', telegramResult);
      throw new Error(`Telegram API error: ${telegramResult.description}`);
    }

    console.log('✅ Auction shared to group successfully');

    // Track analytics
    await supabase.from('auction_analytics').insert({
      auction_id: auctionId,
      telegram_id: sharedBy,
      event_type: 'share',
      event_data: {
        target_chat_id: targetChatId,
        message_id: telegramResult.result.message_id,
        test_mode: testMode,
      },
    });

    console.log('✅ Share analytics tracked');

    return new Response(
      JSON.stringify({
        success: true,
        message_id: telegramResult.result.message_id,
        chat_id: targetChatId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error sharing auction:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
