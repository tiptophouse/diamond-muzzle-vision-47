import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnnouncementRequest {
  message: string;
  groupUrl: string;
  buttonText: string;
  users: any[];
  testMode: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, groupUrl, buttonText, users, testMode }: AnnouncementRequest = await req.json();

    console.log('📢 Send Announcement Request:', {
      messageLength: message.length,
      usersCount: users.length,
      testMode,
      groupUrl
    });

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
      throw new Error('Telegram bot token not configured');
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

    // Create inline keyboard with the group link
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [[
          {
            text: buttonText,
            url: groupUrl
          }
        ]]
      }
    };

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // If test mode, send only to admin
    if (testMode) {
      console.log(`📧 Sending test message to admin: ${adminTelegramId}`);
      
      try {
        const testMessage = `🧪 הודעת בדיקה למנהל:\n\n${message}`;
        
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: testMessage,
            parse_mode: 'HTML',
            ...inlineKeyboard
          })
        });

        const result = await response.json();
        
        if (result.ok) {
          successCount++;
          console.log('✅ Test message sent to admin successfully');
        } else {
          errorCount++;
          errors.push(`Admin test: ${result.description}`);
          console.error('❌ Failed to send test message to admin:', result);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Admin test error: ${error.message}`);
        console.error('❌ Error sending test message to admin:', error);
      }
    } else {
      // Send to all users
      console.log(`📧 Sending announcement to ${users.length} users`);
      
      for (const user of users) {
        try {
          const personalizedMessage = `שלום ${user.first_name || 'משתמש יקר'},\n\n${message}`;
          
          const response = await fetch(`${telegramApiUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: personalizedMessage,
              parse_mode: 'HTML',
              ...inlineKeyboard
            })
          });

          const result = await response.json();
          
          if (result.ok) {
            successCount++;
            console.log(`✅ Message sent to ${user.first_name} (${user.telegram_id})`);
          } else {
            errorCount++;
            errors.push(`${user.first_name}: ${result.description}`);
            console.error(`❌ Failed to send to ${user.first_name}:`, result);
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          errors.push(`${user.first_name}: ${error.message}`);
          console.error(`❌ Error sending to ${user.first_name}:`, error);
        }
      }

      // Also send to admin for confirmation
      try {
        const adminMessage = `📊 הודעת ציון דרך נשלחה!\n\n✅ נשלח בהצלחה: ${successCount}\n❌ נכשל: ${errorCount}\n\nההודעה שנשלחה:\n\n${message}`;
        
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: adminMessage,
            parse_mode: 'HTML',
            ...inlineKeyboard
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

    console.log(`📊 Announcement Results: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit errors to first 10
        message: testMode ? 'Test message sent' : 'Announcement sent to all users'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Send announcement error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send announcement'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});