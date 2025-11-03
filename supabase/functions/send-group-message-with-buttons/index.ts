import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GroupMessageRequest {
  campaignName: string;
  messageText: string;
  senderTelegramId: number;
  buttons: Array<{
    id: string;
    label: string;
    targetPage: string;
  }>;
}

serve(async (req) => {
  console.log('🚀 Send group message with buttons function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignName, messageText, senderTelegramId, buttons }: GroupMessageRequest = await req.json();
    
    console.log('📥 Request data:', { 
      campaignName,
      senderTelegramId,
      buttonsCount: buttons.length,
      messageLength: messageText?.length
    });

    if (!campaignName || !messageText || !senderTelegramId || !buttons?.length) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const groupId = Deno.env.get('B2B_GROUP_ID');
    
    if (!botToken || !groupId) {
      console.error('❌ Bot token or group ID not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token or group ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;
    const botInfo = await fetch(`${telegramApiUrl}/getMe`);
    const botData = await botInfo.json();
    const botUsername = botData.result?.username;

    if (!botUsername) {
      console.error('❌ Failed to get bot username');
      return new Response(
        JSON.stringify({ error: 'Failed to get bot username' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Bot username: ${botUsername}`);

    // Build inline keyboard with web_app buttons for deep linking
    const inlineKeyboard = buttons.map(btn => [{
      text: btn.label,
      web_app: { 
        url: `https://t.me/${botUsername}/diamondmazalbot?startapp=${btn.targetPage}_from_group`
      }
    }]);

    // Escape Markdown special characters
    const escapedMessage = messageText
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/`/g, '\\`');

    console.log(`📧 Sending message to group: ${groupId}`);
    
    const response = await fetch(`${telegramApiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupId,
        text: escapedMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      })
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error('❌ Failed to send message:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send message', details: result.description }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message sent successfully:', result.result.message_id);

    // Track campaign in database
    const { data: campaign, error: campaignError } = await supabase
      .from('telegram_group_campaigns')
      .insert({
        campaign_name: campaignName,
        message_text: messageText,
        target_group_id: parseInt(groupId),
        message_id: result.result.message_id,
        sent_by_telegram_id: senderTelegramId
      })
      .select()
      .single();

    if (campaignError) {
      console.error('⚠️ Failed to track campaign:', campaignError);
    } else {
      console.log('✅ Campaign tracked:', campaign.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.result.message_id,
        campaignId: campaign?.id,
        message: 'Message sent to group successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Send group message error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send group message'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
