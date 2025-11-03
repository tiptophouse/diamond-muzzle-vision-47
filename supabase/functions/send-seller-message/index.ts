import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegram_id, message, diamond_images, diamonds_data } = await req.json();

    console.log('📤 Sending message to buyer:', {
      telegram_id,
      message_length: message?.length,
      images_count: diamond_images?.length || 0,
      diamonds_count: diamonds_data?.length || 0
    });

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

    // Get bot info for web_app URL
    const botInfoResponse = await fetch(`${TELEGRAM_API}/getMe`);
    const botInfo = await botInfoResponse.json();
    const botUsername = botInfo.result?.username || 'mazalbot_bot';

    console.log('🤖 Bot username:', botUsername);

    // Create inline keyboard with web_app buttons for each diamond
    const inlineKeyboard = diamonds_data?.slice(0, 5).map((diamond: any) => [{
      text: `💎 ${diamond.shape} ${diamond.weight}ct - $${diamond.price?.toLocaleString() || 'N/A'}`,
      web_app: {
        url: `https://t.me/${botUsername}/app?startapp=diamond_${diamond.stock}`
      }
    }]) || [];

    console.log('🔘 Created inline buttons:', inlineKeyboard.length);

    // Send message first
    const messageResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error('❌ Telegram API error:', errorData);
      throw new Error(`Telegram API error: ${errorData.description || 'Unknown error'}`);
    }

    const result = await messageResponse.json();
    console.log('✅ Message sent successfully');

    // If there are diamond images, send them as media group
    if (diamond_images && diamond_images.length > 0) {
      console.log('📸 Sending diamond images:', diamond_images.length);
      
      const mediaGroup = diamond_images.slice(0, 10).map((url: string, index: number) => ({
        type: 'photo',
        media: url,
        caption: index === 0 ? 'יהלומים תואמים 💎' : undefined
      }));

      const mediaResponse = await fetch(`${TELEGRAM_API}/sendMediaGroup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegram_id,
          media: mediaGroup
        }),
      });

      if (mediaResponse.ok) {
        console.log('✅ Diamond images sent successfully');
      } else {
        console.error('⚠️ Failed to send diamond images, but message was sent');
      }
    }

    // Send inline keyboard buttons if available
    if (inlineKeyboard.length > 0) {
      console.log('🔘 Sending inline buttons...');
      
      const buttonsResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: '🔽 לחץ על יהלום לצפייה מלאה באפליקציה:',
          reply_markup: {
            inline_keyboard: inlineKeyboard
          }
        }),
      });

      if (buttonsResponse.ok) {
        console.log('✅ Inline buttons sent successfully');
      } else {
        console.error('⚠️ Failed to send inline buttons');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message_id: result.result.message_id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-seller-message:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
