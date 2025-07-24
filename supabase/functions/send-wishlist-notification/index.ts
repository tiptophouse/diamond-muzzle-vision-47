
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WishlistNotificationRequest {
  diamondData: {
    stockNumber: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    price: number;
    imageUrl?: string;
  };
  visitorInfo: {
    telegramId: number;
    firstName: string;
    lastName?: string;
    username?: string;
    phoneNumber?: string;
  };
  ownerTelegramId: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diamondData, visitorInfo, ownerTelegramId }: WishlistNotificationRequest = await req.json();

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const visitorName = `${visitorInfo.firstName}${visitorInfo.lastName ? ' ' + visitorInfo.lastName : ''}`;
    const contactInfo = visitorInfo.phoneNumber ? `📞 ${visitorInfo.phoneNumber}` : '';

    const messageText = `🌟 **Great News!** Someone added your diamond to their wishlist!

💎 **Diamond Details:**
🔸 **Stock:** ${diamondData.stockNumber}
🔹 **Shape:** ${diamondData.shape}
⚖️ **Weight:** ${diamondData.carat}ct
🎨 **Color:** ${diamondData.color}
💎 **Clarity:** ${diamondData.clarity}
✂️ **Cut:** ${diamondData.cut}
💰 **Price:** $${diamondData.price.toLocaleString()}

👤 **Interested Client:**
**Name:** ${visitorName}
${visitorInfo.username ? `**Username:** @${visitorInfo.username}` : ''}
${contactInfo}

🚀 This is a hot lead! Reach out to them quickly to close the deal.`;

    const presetMessage = `Hello ${visitorName}! 👋

I noticed you added my ${diamondData.carat}ct ${diamondData.shape} diamond (Stock: ${diamondData.stockNumber}) to your wishlist.

💎 **Diamond Details:**
- ${diamondData.carat}ct ${diamondData.shape}
- ${diamondData.color} color, ${diamondData.clarity} clarity
- ${diamondData.cut} cut
- Price: $${diamondData.price.toLocaleString()}

I'd love to discuss this diamond with you and answer any questions you might have. Are you interested in learning more about it?

Looking forward to hearing from you! 💍`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '💬 Contact Client',
            url: `https://t.me/${visitorInfo.username || visitorInfo.telegramId}?text=${encodeURIComponent(presetMessage)}`
          }
        ],
        [
          {
            text: '📱 Call Client',
            callback_data: `call_client_${visitorInfo.telegramId}`
          }
        ]
      ]
    };

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ownerTelegramId,
        text: messageText,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Wishlist notification sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending wishlist notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to send wishlist notification',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
