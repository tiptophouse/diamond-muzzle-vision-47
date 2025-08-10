
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Group CTA function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, buttonText, groupId, botUsername: providedBotUsername } = await req.json();
    console.log('📥 Request data:', { message: !!message, buttonText, groupId, botUsername: providedBotUsername });

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botUsername = providedBotUsername || Deno.env.get('TELEGRAM_BOT_USERNAME') || 'diamondmazalbot';
    const baseUrl = Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com';
    
    // High-converting default message if not provided (Hebrew)
    const defaultMessage = `💎 **BrilliantBot – מציף הזדמנויות שמוכרות**

• ⚡ התאמות מיידיות בין מלאי לביקוש חם
• 🔔 התראות בזמן אמת על לידים ועסקאות
• 🔐 שיתוף מאובטח ללקוחות בלחיצה
• 📊 דשבורד חכם שמראה מה למכור היום

⏱️ תוך 60 שניות אתם באוויר. לחצו על Start או פתחו את הדשבורד:`;

    const finalMessage = message || defaultMessage;
    const finalButtonText = buttonText || '🚀 התחל עכשיו';

    console.log('📤 Sending CTA message to group...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: groupId || -1001009290613,
        text: finalMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: finalButtonText,
                url: `https://t.me/${botUsername}?start=group_activation`
              },
              {
                text: '📊 פתח דשבורד',
                url: `https://t.me/${botUsername}?start=dashboard_direct`
              }
            ]
          ]
        }
      }),
    });

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response:', result);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send group CTA message', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Group CTA message sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        groupId: groupId || -1001009290613
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending group CTA message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
