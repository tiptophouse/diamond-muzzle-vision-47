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
    const { telegram_id } = await req.json();

    if (!telegram_id) {
      throw new Error('telegram_id is required');
    }

    console.log('🧪 TEST: Sending test notification with inline buttons to:', telegram_id);

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME');
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_BOT_USERNAME) {
      throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_USERNAME not configured');
    }

    const telegramBotUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
    console.log('📱 Using Telegram Bot URL:', telegramBotUrl);

    // Test diamond data
    const testDiamonds = ['ABC123', 'XYZ789', 'DEF456'];
    const testMessage = `🧪 **בדיקת כפתורים**\n\nזהו מסר בדיקה עם כפתורים מתוקנים.\nלחץ על הכפתורים למטה כדי לבדוק שהם פותחים את המיני-אפ כראוי.`;

    // Send test photo with diamond card
    const testImageUrl = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800';
    
    const photoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    
    const photoResponse = await fetch(photoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_id,
        photo: testImageUrl,
        caption: testMessage,
        parse_mode: 'Markdown'
      }),
    });

    if (!photoResponse.ok) {
      const errorData = await photoResponse.json();
      console.error('❌ Failed to send photo:', errorData);
      throw new Error(`Failed to send photo: ${errorData.description}`);
    }

    console.log('✅ Test photo sent');

    // Get the deployed app URL for web_app buttons
    const appUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}/app`;
    
    // Create inline buttons using web_app type for proper mini app opening + tracking
    const diamondButtons = testDiamonds.map((stock: string) => ({
      text: `💎 יהלום ${stock}`,
      web_app: { url: `${appUrl}?startapp=diamond_${stock}` }
    }));

    const buttonRows = [];
    for (let i = 0; i < diamondButtons.length; i += 2) {
      buttonRows.push(diamondButtons.slice(i, i + 2));
    }

    // Add "View All" button with web_app
    buttonRows.push([
      { text: '🏪 לכל המלאי', web_app: { url: `${appUrl}?startapp=store` } }
    ]);

    const buttonUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const buttonResponse = await fetch(buttonUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: '👇 **לחץ על הכפתורים למטה לבדיקה:**',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: buttonRows
        }
      }),
    });

    if (!buttonResponse.ok) {
      const errorData = await buttonResponse.json();
      console.error('❌ Failed to send buttons:', errorData);
      throw new Error(`Failed to send buttons: ${errorData.description}`);
    }

    const result = await buttonResponse.json();
    console.log('✅ TEST: Inline buttons sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test notification sent with fixed inline buttons',
        telegram_id,
        bot_url: telegramBotUrl,
        diamonds_tested: testDiamonds
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ TEST ERROR:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send test notification'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
