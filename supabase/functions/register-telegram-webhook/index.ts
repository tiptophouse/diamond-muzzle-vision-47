import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URL not configured');
    }

    // Construct webhook URL
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;

    console.log('🔗 Registering Telegram webhook:', webhookUrl);

    // Register webhook with Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: false,
        }),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Failed to register webhook:', result);
      throw new Error(result.description || 'Failed to register webhook');
    }

    console.log('✅ Webhook registered successfully');

    // Get webhook info to verify
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const webhookInfo = await infoResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        webhook_url: webhookUrl,
        webhook_info: webhookInfo.result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error registering webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
