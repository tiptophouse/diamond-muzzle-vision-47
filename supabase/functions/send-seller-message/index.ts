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
    const { telegram_id, message, diamond_images } = await req.json();

    console.log('📤 Sending message to buyer:', {
      telegram_id,
      message_length: message?.length,
      images_count: diamond_images?.length || 0
    });

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Send message via Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramApiUrl, {
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

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('❌ Telegram API error:', errorData);
      throw new Error(`Telegram API error: ${errorData.description || 'Unknown error'}`);
    }

    const result = await telegramResponse.json();
    console.log('✅ Message sent successfully:', result);

    // If there are diamond images, send them as media group
    if (diamond_images && diamond_images.length > 0) {
      console.log('📸 Sending diamond images:', diamond_images.length);
      
      const mediaGroup = diamond_images.slice(0, 10).map((url: string, index: number) => ({
        type: 'photo',
        media: url,
        caption: index === 0 ? 'יהלומים תואמים 💎' : undefined
      }));

      const mediaGroupUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`;
      
      const mediaResponse = await fetch(mediaGroupUrl, {
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
