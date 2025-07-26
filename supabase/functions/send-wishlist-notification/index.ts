
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WishlistNotificationRequest {
  wishlistOwnerTelegramId: number;
  uploaderInfo: {
    telegramId: number;
    firstName: string;
    username?: string;
  };
  matchedDiamond: {
    stockNumber: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    price: number;
    imageUrl?: string;
  };
}

function generateNotificationMessage(uploaderInfo: any, diamond: any): string {
  const uploaderName = uploaderInfo.firstName;
  const contactInfo = uploaderInfo.username ? `@${uploaderInfo.username}` : `ID: ${uploaderInfo.telegramId}`;
  
  return `🎉 **Wishlist Match Found!**

💎 A diamond matching your wishlist preferences has been uploaded:

📊 **Diamond Details:**
🔸 Stock: ${diamond.stockNumber}
🔹 Shape: ${diamond.shape}
⚖️ Weight: ${diamond.carat}ct
🎨 Color: ${diamond.color}
💎 Clarity: ${diamond.clarity}
✂️ Cut: ${diamond.cut}
💰 Price: $${diamond.price.toLocaleString()}

👤 **Uploaded by:** ${uploaderName}
📱 **Contact:** ${contactInfo}

💬 **Ready to connect?** Tap the button below to start a chat with the seller directly in Telegram!`;
}

serve(async (req) => {
  console.log('🔔 Wishlist notification function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      wishlistOwnerTelegramId, 
      uploaderInfo, 
      matchedDiamond 
    }: WishlistNotificationRequest = await req.json();
    
    console.log('📥 Notification data:', { 
      owner: wishlistOwnerTelegramId, 
      uploader: uploaderInfo.firstName,
      diamond: matchedDiamond.stockNumber
    });

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = generateNotificationMessage(uploaderInfo, matchedDiamond);
    
    // Create inline keyboard for direct contact
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '💬 Contact Seller',
            url: uploaderInfo.username 
              ? `https://t.me/${uploaderInfo.username}`
              : `https://t.me/user?id=${uploaderInfo.telegramId}`
          }
        ],
        [
          {
            text: '👀 View Diamond',
            url: `https://miniapp.mazalbot.com/diamond/${matchedDiamond.stockNumber}`
          }
        ],
        [
          {
            text: '💖 My Wishlist',
            url: 'https://miniapp.mazalbot.com/wishlist'
          }
        ]
      ]
    };

    console.log('📤 Sending wishlist notification...');
    
    const telegramPayload = {
      chat_id: wishlistOwnerTelegramId,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard,
      disable_web_page_preview: false
    };

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramPayload),
    });

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response:', result);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send notification', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Wishlist notification sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        notificationSent: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending wishlist notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
