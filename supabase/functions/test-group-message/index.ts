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
    console.log('🧪 TEST: Sending simple "1" message to hardcoded group');

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const B2B_GROUP_ID = -1002178695748; // Hardcoded group ID
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    console.log('📤 Sending to group:', B2B_GROUP_ID);
    console.log('🔑 Bot token exists:', !!TELEGRAM_BOT_TOKEN);

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: B2B_GROUP_ID,
          text: '1'
        }),
      }
    );

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response:', JSON.stringify(result, null, 2));

    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send message',
          telegram_error: result,
          status: telegramResponse.status
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Message sent successfully, message_id:', result.result?.message_id);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message_id: result.result?.message_id,
        group_id: B2B_GROUP_ID,
        full_response: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Test error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
