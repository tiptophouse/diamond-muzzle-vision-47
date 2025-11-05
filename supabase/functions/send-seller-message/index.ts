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
    const { telegram_id, message, diamond_images, diamond_stocks } = await req.json();

    console.log('📤 Sending message to buyer:', {
      telegram_id,
      message_length: message?.length,
      images_count: diamond_images?.length || 0,
      stocks_count: diamond_stocks?.length || 0
    });

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const MINI_APP_URL = Deno.env.get('MINI_APP_URL') || 'https://uhhljqgxhdhbbhpohxll.lovableproject.com';
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }
    
    console.log('📱 Mini App URL:', MINI_APP_URL);

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

    // Create web_app buttons for each diamond to open in Mini App
    if (diamond_stocks && diamond_stocks.length > 0) {
      const diamondButtons = diamond_stocks.slice(0, 4).map((stock: string) => ({
        text: `💎 ${stock}`,
        web_app: { url: `${MINI_APP_URL}/diamond/${stock}` }
      }));

      // Arrange buttons in rows of 2
      const buttonRows = [];
      for (let i = 0; i < diamondButtons.length; i += 2) {
        buttonRows.push(diamondButtons.slice(i, i + 2));
      }

      // Add "View All" button
      buttonRows.push([
        { text: '🏪 לכל המלאי', web_app: { url: `${MINI_APP_URL}/store` } }
      ]);

      const buttonUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const buttonResponse = await fetch(buttonUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: '💎 לחץ לצפייה ביהלומים:',
          reply_markup: { inline_keyboard: buttonRows }
        }),
      });

      if (buttonResponse.ok) {
        console.log('✅ Web app buttons sent successfully');
      } else {
        console.error('⚠️ Failed to send web app buttons');
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
