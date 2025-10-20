import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEngagementRequest {
  telegramIds: number[];
  message: string;
  buttonText: string;
  buttonUrl: string;
}

serve(async (req) => {
  console.log('🚀 Engagement message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramIds, message, buttonText, buttonUrl }: SendEngagementRequest = await req.json();
    
    console.log('📥 Request data:', { 
      count: telegramIds?.length || 0,
      hasMessage: !!message,
      hasButton: !!(buttonText && buttonUrl)
    });

    if (!telegramIds || telegramIds.length === 0 || !message) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing telegramIds or message' }),
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get blocked users to exclude
    const { data: blockedUsers } = await supabaseClient
      .from('blocked_users')
      .select('telegram_id');

    const blockedIds = new Set(blockedUsers?.map(b => b.telegram_id) || []);
    const eligibleIds = telegramIds.filter(id => !blockedIds.has(id));

    console.log(`✅ ${eligibleIds.length} eligible users (${blockedIds.size} blocked)`);

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Send messages with delay to avoid rate limits
    for (const telegramId of eligibleIds) {
      try {
        const messagePayload: any = {
          chat_id: telegramId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        };

        // Add inline keyboard if button data provided
        if (buttonText && buttonUrl) {
          messagePayload.reply_markup = {
            inline_keyboard: [[{
              text: buttonText,
              url: buttonUrl
            }]]
          };
        }

        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload),
          }
        );

        const result = await response.json();

        if (result.ok) {
          successCount++;
          console.log(`✅ Sent to ${telegramId}`);
          
          // Delay to respect rate limits (30 messages per second)
          await new Promise(resolve => setTimeout(resolve, 35));
        } else {
          failureCount++;
          const errorMsg = `User ${telegramId}: ${result.description}`;
          errors.push(errorMsg);
          console.error(`❌ Failed: ${errorMsg}`);
        }
      } catch (error) {
        failureCount++;
        const errorMsg = `User ${telegramId}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ Error sending to user:`, errorMsg);
      }
    }

    // Log campaign results
    await supabaseClient.from('bot_usage_analytics').insert({
      telegram_id: 2138564172, // Admin
      chat_id: 2138564172,
      message_type: 'campaign',
      chat_type: 'bulk',
      message_data: {
        campaign: 'engagement_boost',
        total_users: eligibleIds.length,
        success: successCount,
        failed: failureCount,
        blocked_excluded: blockedIds.size
      }
    });

    console.log(`📊 Campaign complete: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          total_users: eligibleIds.length,
          messages_sent: successCount,
          messages_failed: failureCount,
          blocked_users_excluded: blockedIds.size
        },
        errors: errors.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Engagement message error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
