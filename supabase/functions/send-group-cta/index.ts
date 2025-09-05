
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
    const { 
      message, 
      groupId, 
      botUsername: providedBotUsername,
      useButtons = false, // Default to false for now
      buttonText = '🚀 הצטרף ל-BrilliantBot',
      buttonUrl
    } = await req.json();
    
    console.log('📥 CTA request:', { 
      hasMessage: !!message, 
      groupId, 
      botUsername: providedBotUsername,
      useButtons
    });

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botUsername = providedBotUsername || Deno.env.get('TELEGRAM_BOT_USERNAME') || 'diamondmazalbot';
    
    // Growth announcement message
    const defaultMessage = `🎉 **מזל טוב! אנחנו גדלים!**

💎 **BrilliantBot חוגג: 400+ סוחרי יהלומים פעילים!**

🚀 **מה שהתחיל כחלום הפך למציאות:**
• 400+ סוחרי יהלומים מובילים
• אלפי יהלומים נמכרו דרך המערכת
• חיסכון של מיליוני שקלים בעלויות
• רשת הסוחרים הגדולה והמתקדמת בישראל

💪 **אנחנו ממשיכים לחדש ולהוביל בתחום טכנולוגיית היהלומים**

🙏 **תודה לכל הסוחרים שהאמינו בנו מההתחלה!**

#יהלומים #BrilliantBot #גדלים_יחד #400_סוחרים`;

    const finalMessage = message || defaultMessage;

    let telegramPayload: any = {
      chat_id: groupId || -1001009290613,
      text: finalMessage,
      parse_mode: 'Markdown'
    };

    // Only add buttons if explicitly requested
    if (useButtons) {
      const finalButtonText = buttonText || '🚀 הצטרף ל-BrilliantBot';
      const finalButtonUrl = buttonUrl || `https://diamondbot-store.vercel.app/?utm_source=group_cta&utm_campaign=growth_announcement&start=group_activation&button_clicked=join_brilliantbot`;
      
      // If buttonUrl starts with https://t.me/, use url instead of web_app
      if (finalButtonUrl.startsWith('https://t.me/')) {
        telegramPayload.reply_markup = {
          inline_keyboard: [[
            {
              text: finalButtonText,
              url: finalButtonUrl
            }
          ]]
        };
      } else {
        telegramPayload.reply_markup = {
          inline_keyboard: [[
            {
              text: finalButtonText,
              web_app: {
                url: finalButtonUrl
              }
            }
          ]]
        };
      }
    }

    console.log('📤 Sending message to group:', groupId || -1001009290613);
    
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
        JSON.stringify({ error: 'Failed to send group message', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Group message sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        groupId: groupId || -1001009290613,
        messageType: useButtons ? 'with_buttons' : 'text_only',
        userCount: '400+'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending group message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
