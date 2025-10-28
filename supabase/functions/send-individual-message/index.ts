
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessageButton {
  text: string;
  url: string;
}

interface SendMessageRequest {
  telegramId: number;
  message: string;
  buttons?: MessageButton[];
}

serve(async (req) => {
  console.log('🚀 Individual message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramId, message, buttons }: SendMessageRequest = await req.json();
    
    console.log('📥 Request data:', { 
      telegramId, 
      hasMessage: !!message, 
      buttonsCount: buttons?.length || 0 
    });

    if (!telegramId || !message) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing telegramId or message' }),
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

    // Prepare the message payload with signature
    const messageWithSignature = `${message}\n\n<i>Provided by BrilliantBot</i>`;
    
    const messagePayload: any = {
      chat_id: telegramId,
      text: messageWithSignature,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    };

    // Add inline keyboard if buttons are provided
    if (buttons && buttons.length > 0) {
      const keyboard = buttons.map(button => [{
        text: button.text,
        url: button.url
      }]);

      messagePayload.reply_markup = {
        inline_keyboard: keyboard
      };
    }

    console.log('📤 Sending message to Telegram API...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response status:', telegramResponse.status);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      
      // Handle specific Telegram errors
      let errorMessage = 'Failed to send message';
      if (result.description) {
        if (result.description.includes('bot was blocked')) {
          errorMessage = 'User blocked the bot';
        } else if (result.description.includes('chat not found')) {
          errorMessage = 'User not found';
        } else if (result.description.includes('Too Many Requests')) {
          errorMessage = 'Rate limit exceeded';
        } else {
          errorMessage = result.description;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          telegram_error: result
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message sent successfully to user:', telegramId);
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending individual message:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
