
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvestmentNotificationRequest {
  message: string;
  users: any[];
  testMode: boolean;
  timestamp: string;
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

    const { message, users, testMode, timestamp }: InvestmentNotificationRequest = await req.json();

    console.log('💼 Send Investment Notification Request:', {
      messageLength: message.length,
      usersCount: users.length,
      testMode,
      timestamp
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

    // Create inline keyboard with investment portal link
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🚀 View Investment Opportunity",
            url: "https://brilliantbot-investor-hub.lovable.app/investment"
          }
        ]]
      }
    };

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // If test mode, send only to admin
    if (testMode) {
      console.log(`📧 Sending test investment notification to admin: ${adminTelegramId}`);
      
      try {
        const testMessage = `🧪 הודעת השקעה לבדיקה למנהל:\n\n${message}`;
        
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: testMessage,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        });

        const result = await response.json();
        
        if (result.ok) {
          successCount++;
          console.log('✅ Test investment notification sent to admin successfully');
        } else {
          errorCount++;
          errors.push(`Admin test: ${result.description}`);
          console.error('❌ Failed to send test investment notification to admin:', result);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Admin test error: ${error.message}`);
        console.error('❌ Error sending test investment notification to admin:', error);
      }
    } else {
      // Send to all users
      console.log(`📧 Sending investment notification to ${users.length} users`);
      
      for (const user of users) {
        try {
          const personalizedMessage = `שלום ${user.first_name || 'משתמש יקר'},\n\n${message}`;
          
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
            console.log(`✅ Investment notification sent to ${user.first_name} (${user.telegram_id})`);
          } else {
            errorCount++;
            errors.push(`${user.first_name}: ${result.description}`);
            console.error(`❌ Failed to send investment notification to ${user.first_name}:`, result);
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          errors.push(`${user.first_name}: ${error.message}`);
          console.error(`❌ Error sending investment notification to ${user.first_name}:`, error);
        }
      }

      // Send confirmation to admin
      try {
        const adminMessage = `💼 הודעת השקעה נשלחה!\n\n✅ נשלח בהצלחה: ${successCount}\n❌ נכשל: ${errorCount}\n\n📊 סטטיסטיקות קמפיין:\n• 49 משתמשי פרימיום קיימים\n• הזדמנות השקעה: 3-15% מהון\n• מגבלת זמן: 72 שעות\n\nההודעה שנשלחה:\n\n${message}`;
        
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: adminMessage,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        });

        const result = await response.json();
        if (result.ok) {
          console.log('✅ Investment notification confirmation sent to admin');
        }
      } catch (error) {
        console.error('❌ Error sending investment notification confirmation to admin:', error);
      }
    }

    console.log(`📊 Investment Notification Results: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit errors to first 10
        message: testMode ? 'Test investment notification sent' : 'Investment notification sent to all users',
        campaignType: 'investment_opportunity',
        timestamp: timestamp
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Send investment notification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send investment notification'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
