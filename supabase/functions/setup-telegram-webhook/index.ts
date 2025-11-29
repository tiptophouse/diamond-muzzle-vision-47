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
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    const WEBHOOK_URL = 'https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/telegram-webhook';

    console.log('🔧 Setting up Telegram webhook...');
    console.log('📍 Webhook URL:', WEBHOOK_URL);

    // Set webhook
    const setWebhookResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: WEBHOOK_URL,
          allowed_updates: ['message', 'callback_query', 'inline_query']
        })
      }
    );

    const setWebhookData = await setWebhookResponse.json();
    console.log('✅ setWebhook response:', setWebhookData);

    // Get webhook info to verify
    const getWebhookResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );

    const webhookInfo = await getWebhookResponse.json();
    console.log('📊 Webhook info:', webhookInfo);

    return new Response(
      JSON.stringify({
        success: true,
        webhook_url: WEBHOOK_URL,
        webhook_set: setWebhookData,
        webhook_info: webhookInfo
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
