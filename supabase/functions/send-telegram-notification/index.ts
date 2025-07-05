import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  telegram_id: number;
  message: string;
  message_type?: string;
  notification_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📤 Send Telegram notification called');
    
    const { telegram_id, message, message_type = 'info', notification_id }: NotificationRequest = await req.json();
    
    if (!telegram_id || !message) {
      throw new Error('Missing required fields: telegram_id and message');
    }

    console.log(`📤 Sending notification to Telegram ID: ${telegram_id}`);

    // Send message via Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', telegramResult);
      
      // Update notification status to failed if notification_id provided
      if (notification_id) {
        await supabase
          .from('notifications')
          .update({ 
            status: 'failed',
            metadata: { 
              error: telegramResult.description || 'Unknown error',
              error_code: telegramResult.error_code 
            }
          })
          .eq('id', notification_id);
      }
      
      throw new Error(`Telegram API error: ${telegramResult.description}`);
    }

    console.log('✅ Notification sent successfully via Telegram');

    // Update notification status to delivered if notification_id provided
    if (notification_id) {
      await supabase
        .from('notifications')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          metadata: { telegram_message_id: telegramResult.result.message_id }
        })
        .eq('id', notification_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        telegram_message_id: telegramResult.result.message_id 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Send notification error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});