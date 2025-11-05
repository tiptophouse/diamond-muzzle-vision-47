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

    let result;

    // If there are diamond images, send them as media group with message caption
    if (diamond_images && diamond_images.length > 0) {
      console.log('📸 Sending diamond images with message caption:', diamond_images.length);
      
      const mediaGroup = diamond_images.slice(0, 10).map((url: string, index: number) => ({
        type: 'photo',
        media: url,
        caption: index === 0 ? message : undefined,
        parse_mode: index === 0 ? 'HTML' : undefined
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

      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        console.error('❌ Failed to send diamond images:', errorData);
        throw new Error(`Failed to send images: ${errorData.description || 'Unknown error'}`);
      }

      const mediaResult = await mediaResponse.json();
      console.log('✅ Diamond images sent successfully');
      result = mediaResult;
    } else {
      // No images - send as regular message
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

      result = await telegramResponse.json();
      console.log('✅ Message sent successfully');
    }

    // Send inline keyboard buttons
    const buttonUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const buttonResponse = await fetch(buttonUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: '💎 מה תרצה לעשות?',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📞 צור קשר למידע נוסף', callback_data: 'contact_for_info' }
            ],
            [
              { text: '📋 פרטים נוספים', callback_data: 'more_details' },
              { text: '🔍 חפש עוד', callback_data: 'search_more' }
            ]
          ]
        }
      }),
    });

    if (buttonResponse.ok) {
      console.log('✅ Action buttons sent successfully');
    } else {
      console.error('⚠️ Failed to send action buttons, but message was delivered');
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
