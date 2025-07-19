import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Tutorial message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramId, firstName, customMessage } = await req.json();
    console.log('📥 Request data:', { telegramId, firstName, customMessage: !!customMessage });
    
    if (!telegramId) {
      console.error('❌ Missing telegram ID');
      return new Response(
        JSON.stringify({ error: 'Missing telegram ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create tutorial message
    const userName = firstName ? `${firstName}` : 'there';
    const tutorialUrl = `https://miniapp.mazalbot.com/?tutorial=start`;
    
    const message = customMessage || `🎓 **Tutorial Available!**

Hello ${userName}! 👋

Ready to get started with our diamond inventory system? We've prepared a comprehensive tutorial to help you:

📚 **What you'll learn:**
• How to upload diamond inventory
• Navigate the store interface  
• Use advanced search features
• Manage your diamond collection

🚀 **Get Started:**
Click the link below to launch the interactive tutorial in the app:

🔗 [Start Tutorial Now](${tutorialUrl})

💡 The tutorial takes just 5 minutes and will have you managing diamonds like a pro!

Need help? Just reply to this message and we'll assist you personally.`;

    console.log('📤 Sending tutorial message to Telegram...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [[
            {
              text: "🎓 Start Tutorial",
              url: tutorialUrl
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
        JSON.stringify({ error: 'Failed to send Telegram message', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Tutorial message sent successfully');
    return new Response(
      JSON.stringify({ success: true, messageId: result.result.message_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending tutorial message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});