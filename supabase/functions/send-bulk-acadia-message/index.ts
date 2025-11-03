import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkMessageRequest {
  message: string;
  senderName: string;
  senderId: number;
  users: any[];
  testMode: boolean;
}

serve(async (req) => {
  console.log('🚀 Bulk Acadia message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, senderName, senderId, users, testMode }: BulkMessageRequest = await req.json();
    
    console.log('📥 Request data:', { 
      senderName,
      senderId,
      usersCount: users.length,
      testMode,
      messageLength: message?.length
    });

    if (!message || !senderName || !senderId) {
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

    // Get admin telegram ID
    const { data: adminSettings } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_telegram_id')
      .single();

    let adminTelegramId = 2138564172; // fallback
    
    if (adminSettings?.setting_value) {
      const settingValue = adminSettings.setting_value;
      if (typeof settingValue === 'number') {
        adminTelegramId = settingValue;
      } else if (typeof settingValue === 'object' && settingValue.value) {
        adminTelegramId = parseInt(settingValue.value);
      } else if (typeof settingValue === 'object' && settingValue.admin_telegram_id) {
        adminTelegramId = parseInt(settingValue.admin_telegram_id);
      } else if (typeof settingValue === 'string') {
        adminTelegramId = parseInt(settingValue);
      }
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

    // Create inline keyboard for easy access
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔗 התחבר ל-BrilliantBot',
              url: 'https://t.me/diamondmazalbot'
            }
          ],
          [
            {
              text: '📋 Generate SFTP',
              callback_data: 'generate_sftp_connection'
            }
          ]
        ]
      }
    };

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // If test mode, send only to admin
    if (testMode) {
      console.log(`📧 Sending test Acadia message to admin: ${adminTelegramId}`);
      
      try {
        // Escape Markdown special characters in test message too
        const escapedTestMessage = message
          .replace(/\*/g, '\\*')
          .replace(/_/g, '\\_')
          .replace(/\[/g, '\\[')
          .replace(/`/g, '\\`');
          
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: escapedTestMessage,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        });

        const result = await response.json();
        
        if (result.ok) {
          successCount++;
          console.log('✅ Test Acadia message sent to admin successfully');
        } else {
          errorCount++;
          errors.push(`Admin test: ${result.description}`);
          console.error('❌ Failed to send test Acadia message to admin:', result);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Admin test error: ${error.message}`);
        console.error('❌ Error sending test Acadia message to admin:', error);
      }
    } else {
      // Send to all users
      console.log(`📧 Sending Acadia message to ${users.length} users`);
      
      for (const user of users) {
        try {
          // Escape Markdown special characters in user-provided content
          const escapedMessage = message
            .replace(/\*/g, '\\*')
            .replace(/_/g, '\\_')
            .replace(/\[/g, '\\[')
            .replace(/`/g, '\\`');
          
          const personalizedMessage = `שלום ${user.first_name || 'יקר/ה'}! 👋

${escapedMessage}

*הודעה זו נשלחה על ידי ${senderName}*`;
          
          const response = await fetch(`${telegramApiUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: personalizedMessage,
              parse_mode: 'Markdown',
              ...inlineKeyboard
            })
          });

          const result = await response.json();
          
          if (result.ok) {
            successCount++;
            console.log(`✅ Acadia message sent to ${user.first_name} (${user.telegram_id})`);
            
            // Track the message in notifications table
            try {
              await supabase.from('notifications').insert({
                telegram_id: user.telegram_id,
                message_type: 'acadia_connection',
                message_content: personalizedMessage,
                status: 'sent',
                metadata: {
                  bulk_message: true,
                  sender_id: senderId,
                  sender_name: senderName,
                  message_timestamp: new Date().toISOString()
                }
              });
            } catch (notificationError) {
              console.warn('⚠️ Failed to track notification:', notificationError);
            }
            
          } else {
            errorCount++;
            errors.push(`${user.first_name}: ${result.description}`);
            console.error(`❌ Failed to send Acadia message to ${user.first_name}:`, result);
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          errors.push(`${user.first_name}: ${error.message}`);
          console.error(`❌ Error sending Acadia message to ${user.first_name}:`, error);
        }
      }

      // Send confirmation to admin
      try {
        const adminMessage = `📨 **Bulk Acadia Message Complete!**

**Message Type:** Acadia Connection Instructions
**Target:** All Users

**Results:**
✅ Successfully sent: ${successCount}
❌ Failed: ${errorCount}

**Sent by:** ${senderName} (${senderId})

${errorCount > 0 ? `\n**Errors (first 5):**\n${errors.slice(0, 5).join('\n')}` : ''}

The Acadia connection message campaign has been completed!`;
        
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: adminMessage,
            parse_mode: 'Markdown'
          })
        });

        const result = await response.json();
        if (result.ok) {
          console.log('✅ Confirmation sent to admin');
        }
      } catch (error) {
        console.error('❌ Error sending confirmation to admin:', error);
      }
    }

    console.log(`📊 Acadia Message Results: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit errors to first 10
        message: testMode ? 'Test Acadia message sent' : 'Acadia message sent to all users'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Bulk Acadia message error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send bulk Acadia message'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});