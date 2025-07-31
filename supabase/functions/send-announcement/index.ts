
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface User {
  telegram_id: number;
  first_name: string;
}

interface AnnouncementRequest {
  message: string;
  telegramGroupUrl: string;
  isTest: boolean;
  testTelegramId?: number;
  users?: User[];
}

serve(async (req) => {
  console.log('🚀 Announcement sender function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, telegramGroupUrl, isTest, testTelegramId, users }: AnnouncementRequest = await req.json();
    console.log('📥 Request data:', { isTest, userCount: users?.length, testTelegramId });
    
    if (!message || !telegramGroupUrl) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing message or telegramGroupUrl' }),
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

    // Create inline keyboard with group join button
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🎯 הצטרף לקבוצת הליבה",
            url: telegramGroupUrl
          }
        ]
      ]
    };

    if (isTest && testTelegramId) {
      // Send test message to admin
      console.log('📤 Sending test message to admin...');
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: testTelegramId,
          text: `🧪 הודעת מבחן:\n\n${message}`,
          reply_markup: keyboard,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        }),
      });

      const result = await telegramResponse.json();
      console.log('📨 Test message result:', result);
      
      if (!telegramResponse.ok) {
        console.error('❌ Telegram API error:', result);
        return new Response(
          JSON.stringify({ error: 'Failed to send test message', details: result }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, messageId: result.result.message_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (!isTest && users) {
      // Send bulk messages
      console.log('📤 Sending bulk messages to', users.length, 'users...');
      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const user of users) {
        try {
          const personalizedMessage = `שלום ${user.first_name},\n\n${message}`;
          
          const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: personalizedMessage,
              reply_markup: keyboard,
              parse_mode: 'HTML',
              disable_web_page_preview: false
            }),
          });

          const result = await telegramResponse.json();
          
          if (telegramResponse.ok) {
            successCount++;
            results.push({ telegram_id: user.telegram_id, success: true });
            console.log('✅ Message sent successfully to:', user.telegram_id);
          } else {
            failureCount++;
            results.push({ telegram_id: user.telegram_id, success: false, error: result });
            console.error('❌ Failed to send to:', user.telegram_id, result);
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          failureCount++;
          results.push({ telegram_id: user.telegram_id, success: false, error: error.message });
          console.error('❌ Error sending to user:', user.telegram_id, error);
        }
      }

      console.log('📊 Bulk send complete:', { successCount, failureCount, total: users.length });

      return new Response(
        JSON.stringify({ 
          success: true, 
          stats: { successCount, failureCount, total: users.length },
          results 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Error in announcement sender:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
