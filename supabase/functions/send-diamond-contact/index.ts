import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactRequest {
  diamondData: {
    stockNumber: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    price: number;
    lab?: string;
    certificateNumber?: string;
    imageUrl?: string;
    certificateUrl?: string;
  };
  visitorInfo: {
    telegramId?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  ownerTelegramId: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { diamondData, visitorInfo, ownerTelegramId }: ContactRequest = await req.json();

    // Create the message content
    const visitorName = visitorInfo.firstName ? 
      `${visitorInfo.firstName}${visitorInfo.lastName ? ' ' + visitorInfo.lastName : ''}` : 
      visitorInfo.username || 'Anonymous';

    const messageText = `💎 **Diamond Inquiry**

👤 **Visitor:** ${visitorName}${visitorInfo.username ? ` (@${visitorInfo.username})` : ''}
${visitorInfo.telegramId ? `📱 **Telegram ID:** ${visitorInfo.telegramId}` : ''}

💎 **Diamond Details:**
🔸 **Stock:** ${diamondData.stockNumber}
🔹 **Shape:** ${diamondData.shape}
⚖️ **Weight:** ${diamondData.carat}ct
🎨 **Color:** ${diamondData.color}
💎 **Clarity:** ${diamondData.clarity}
✂️ **Cut:** ${diamondData.cut}
💰 **Price:** $${diamondData.price.toLocaleString()}
${diamondData.lab ? `📋 **Lab:** ${diamondData.lab}` : ''}
${diamondData.certificateNumber ? `🆔 **Cert #:** ${diamondData.certificateNumber}` : ''}

🗨️ Someone is interested in this diamond! Contact them to discuss further.`;

    // Send message via Telegram Bot API
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const telegramPayload = {
      chat_id: ownerTelegramId,
      text: messageText,
      parse_mode: 'Markdown',
      reply_markup: visitorInfo.telegramId ? {
        inline_keyboard: [[
          {
            text: '💬 Start Chat',
            url: `https://t.me/${visitorInfo.username || visitorInfo.telegramId}`
          }
        ]]
      } : undefined
    };

    console.log('📤 Sending contact message to owner:', ownerTelegramId);
    console.log('📊 Diamond data:', diamondData);
    console.log('👤 Visitor info:', visitorInfo);

    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramPayload),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', telegramResult);
      throw new Error(`Telegram API error: ${telegramResult.description}`);
    }

    console.log('✅ Contact message sent successfully');

    // Log the contact attempt in analytics
    await supabase.from('diamond_share_analytics').insert({
      diamond_stock_number: diamondData.stockNumber,
      owner_telegram_id: ownerTelegramId,
      viewer_telegram_id: visitorInfo.telegramId,
      session_id: crypto.randomUUID(),
      view_timestamp: new Date().toISOString(),
      device_type: 'contact_inquiry',
      viewed_other_diamonds: false
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact message sent successfully',
        telegramMessageId: telegramResult.result.message_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error sending contact message:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to send contact message',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});