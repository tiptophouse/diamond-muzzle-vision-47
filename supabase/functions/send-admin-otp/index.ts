
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email }: SendOTPRequest = await req.json();
    
    console.log('🔐 Admin OTP request for email:', email);

    // Only allow your admin email
    if (email !== 'avtipoos@gmail.com') {
      console.log('❌ Unauthorized email attempt:', email);
      return new Response(
        JSON.stringify({ error: 'Unauthorized access attempt' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const adminTelegramId = 2138564172;

    console.log('🔢 Generated OTP:', otp);

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        email,
        telegram_id: adminTelegramId,
        code: otp,
        expires_at: expiresAt.toISOString()
      });

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error('Failed to store OTP');
    }

    // Send OTP via Telegram Bot
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const telegramMessage = `🔐 Admin Login OTP\n\nYour one-time password: ${otp}\n\nValid for 5 minutes.\n\nIf you didn't request this, ignore this message.`;

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: adminTelegramId,
        text: telegramMessage,
        parse_mode: 'HTML'
      }),
    });

    if (!telegramResponse.ok) {
      const telegramError = await telegramResponse.text();
      console.error('❌ Telegram API error:', telegramError);
      throw new Error('Failed to send OTP via Telegram');
    }

    console.log('✅ OTP sent successfully to Telegram');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent to your Telegram' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('❌ Error in send-admin-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
