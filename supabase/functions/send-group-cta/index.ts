
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
    const { message, buttonText, groupId } = await req.json();
    console.log('📥 Request data:', { message: !!message, buttonText, groupId });

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'BrilliantBot_bot';
    
    // Default message if not provided
    const defaultMessage = `💎 **שדרגו את הפעילות שלכם ביהלומים!**

🤖 BrilliantBot כאן כדי לעזור לכם:
• ✨ התאמות חכמות של יהלומים
• 📊 ניתוחי שוק בזמן אמת  
• 🔍 חיפוש מתקדם במלאי
• 💰 הזדמনויות השקעה

⚡ **התחילו עכשיו - לחצו על הכפתור למטה!**`;

    const finalMessage = message || defaultMessage;
    const finalButtonText = buttonText || '🚀 התחל עם BrilliantBot';

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
          inline_keyboard: [[
            {
              text: finalButtonText,
              url: `https://t.me/${botUsername}?start=group_activation`
            }
          ]]
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
