
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OTPRequest {
  otp: string;
  telegram_id: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { otp, telegram_id }: OTPRequest = await req.json();
    
    console.log('🔐 Sending OTP via Telegram to:', telegram_id);
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Telegram bot not configured' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const message = `🔐 *BrilliantBot Admin Login*\n\n` +
                   `Your secure OTP code: \`${otp}\`\n\n` +
                   `⏰ Valid for 10 minutes\n` +
                   `🚨 Do not share this code with anyone\n\n` +
                   `If you didn't request this, please ignore this message.`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      }),
    });

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to send OTP via Telegram',
          error: telegramResult.description 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('✅ OTP sent successfully via Telegram');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent to your Telegram successfully',
        delivery_method: 'telegram'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-telegram-otp:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
