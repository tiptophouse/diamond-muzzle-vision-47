import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

/**
 * Setup Telegram Webhook
 * 
 * This function registers the telegram-webhook edge function with Telegram
 * so that button clicks and other updates are sent to our edge function.
 * 
 * Usage:
 * 1. Call this edge function once: POST to /setup-webhook
 * 2. It will automatically configure the webhook URL with Telegram
 * 3. After setup, all button clicks will work
 */
serve(async (req) => {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URL not configured');
    }

    // Construct the webhook URL
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
    
    console.log('🔧 Setting up webhook:', webhookUrl);

    // Call Telegram's setWebhook API
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true, // Clear any pending updates
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Telegram API error:', result);
      throw new Error(`Telegram API error: ${result.description}`);
    }

    console.log('✅ Webhook configured successfully:', result);

    // Verify webhook info
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const webhookInfo = await infoResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook configured successfully! 🎉',
        webhook_url: webhookUrl,
        webhook_info: webhookInfo.result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});