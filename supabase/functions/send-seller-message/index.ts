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
    const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME');
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }
    
    if (!TELEGRAM_BOT_USERNAME) {
      throw new Error('TELEGRAM_BOT_USERNAME not configured');
    }
    
    const appUrl = Deno.env.get('WEBAPP_URL') || 'https://miniapp.mazalbot.com';
    console.log('📱 Using WebApp URL:', appUrl);

    let result;

    // Send diamond card with image and message
    if (diamond_images && diamond_images.length > 0) {
      console.log('📸 Sending diamond card with image:', diamond_images[0]);
      
      // Use sendPhoto for the first image with message as caption (better UX than media group)
      const photoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
      
      const photoResponse = await fetch(photoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegram_id,
          photo: diamond_images[0],
          caption: message,
          parse_mode: 'HTML'
        }),
      });

      if (!photoResponse.ok) {
        const errorData = await photoResponse.json();
        console.error('❌ Failed to send diamond card:', errorData);
        throw new Error(`Failed to send image: ${errorData.description || 'Unknown error'}`);
      }

      const photoResult = await photoResponse.json();
      console.log('✅ Diamond card sent successfully');
      result = photoResult;
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

    // Always send inline buttons with Telegram deep links (open in Mini App)
    if (diamond_stocks && diamond_stocks.length > 0) {
      console.log('💎 Sending inline buttons for diamonds:', diamond_stocks.length);
      
      const cleanBotUsername = TELEGRAM_BOT_USERNAME.startsWith('@') ? TELEGRAM_BOT_USERNAME.substring(1) : TELEGRAM_BOT_USERNAME;
      
      const diamondButtons = diamond_stocks.slice(0, 4).map((stock: string) => ({
        text: `💎 צפה במלאי ${stock}`,
        url: `https://t.me/${cleanBotUsername}/app?startapp=diamond_${stock}`
      }));

      // Arrange buttons in rows of 2
      const buttonRows = [];
      for (let i = 0; i < diamondButtons.length; i += 2) {
        buttonRows.push(diamondButtons.slice(i, i + 2));
      }

      // Add "View All" button
      buttonRows.push([
        { text: '🏪 לכל המלאי', url: `https://t.me/${cleanBotUsername}/app?startapp=store` }
      ]);

      const buttonUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const buttonResponse = await fetch(buttonUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: '💎 לחץ לצפייה ביהלומים במערכת:',
          reply_markup: { inline_keyboard: buttonRows }
        }),
      });

      if (!buttonResponse.ok) {
        const errorData = await buttonResponse.json();
        console.error('⚠️ Failed to send web app buttons:', errorData);
      } else {
        console.log('✅ Inline web_app buttons sent successfully');
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
