
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PromotionRequest {
  testMode?: boolean;
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

    const { testMode = false }: PromotionRequest = await req.json();

    console.log('🎉 Starting premium user promotion process...');

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

    // Get all users who are not already premium
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('telegram_id, first_name, last_name, is_premium, subscription_plan')
      .eq('status', 'active')
      .neq('is_premium', true);

    if (usersError) {
      throw usersError;
    }

    console.log(`📊 Found ${users?.length || 0} users to promote to premium`);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users found to promote',
          promotedCount: 0,
          notificationsSent: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let promotedCount = 0;
    let notificationsSent = 0;
    let errors: string[] = [];

    // If test mode, only process admin user
    const usersToProcess = testMode ? 
      users.filter(u => u.telegram_id === adminTelegramId) : 
      users;

    console.log(`🔧 ${testMode ? 'TEST MODE' : 'LIVE MODE'}: Processing ${usersToProcess.length} users`);

    for (const user of usersToProcess) {
      try {
        // Update user to premium
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            is_premium: true,
            subscription_plan: 'premium',
            updated_at: new Date().toISOString()
          })
          .eq('telegram_id', user.telegram_id);

        if (updateError) {
          console.error(`❌ Failed to update user ${user.telegram_id}:`, updateError);
          errors.push(`Update ${user.first_name}: ${updateError.message}`);
          continue;
        }

        promotedCount++;
        console.log(`✅ Promoted user ${user.first_name} (${user.telegram_id}) to premium`);

        // Update user analytics
        await supabase
          .from('user_analytics')
          .upsert({
            telegram_id: user.telegram_id,
            subscription_status: 'premium',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'telegram_id'
          });

        // Send premium notification
        const userName = user.first_name && user.first_name !== 'Telegram' && user.first_name !== 'Test' 
          ? user.first_name 
          : 'יקר/ה';

        const premiumMessage = `🎉 **ברוך הבא למועדון הפרימיום!**

שלום ${userName},

אנחנו נרגשים להודיע לך שהחשבון שלך שודרג לפרימיום! 🌟

🔥 **הטבות הפרימיום החדשות שלך:**

💎 **גישה ל-100+ קבוצות יהלומים נבחרות**
📈 **הגבלות גבוהות יותר על העלאות**
⚡ **גישה מוקדמת לפיצ'רים חדשים**
🚀 **ממשק משתמש משופר**
🔍 **חיפוש מתקדם ללא הגבלות**
📊 **דוחות מתקדמים ותובנות**
💬 **תמיכה מועדפת**
🎯 **התאמות אישיות מתקדמות**

🎁 **בונוסים מיוחדים:**
- גישה לקבוצות VIP עם יהלומים נדירים
- התראות מיידיות על הזדמנויות חמות
- כלים מתקדמים לניתוח שוק

✨ השדרוג שלך פעיל מיידית!

תודה שבחרת להיות חלק מהקהילה שלנו 💙`;

        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegram_id,
            text: premiumMessage,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '🚀 חקור את הפיצ\'רים החדשים',
                  web_app: { url: `https://uhhljqgxhdhbbhpohxll.supabase.co` }
                }
              ]]
            }
          })
        });

        const result = await response.json();
        
        if (result.ok) {
          notificationsSent++;
          console.log(`📧 Premium notification sent to ${userName} (${user.telegram_id})`);
        } else {
          console.error(`❌ Failed to send notification to ${userName}:`, result);
          errors.push(`Notification to ${userName}: ${result.description}`);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error processing user ${user.first_name}:`, error);
        errors.push(`${user.first_name}: ${error.message}`);
      }
    }

    // Send summary to admin
    try {
      const summaryMessage = `📊 **דו"ח שדרוג פרימיום**

${testMode ? '🧪 **מצב בדיקה**\n\n' : ''}✅ **משתמשים ששודרגו:** ${promotedCount}
📧 **התראות נשלחו:** ${notificationsSent}
❌ **שגיאות:** ${errors.length}

${errors.length > 0 ? `\n**שגיאות:**\n${errors.slice(0, 5).map(e => `• ${e}`).join('\n')}` : ''}

🎉 כל המשתמשים הפעילים שודרגו בהצלחה לפרימיום!`;

      const adminResponse = await fetch(`${telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminTelegramId,
          text: summaryMessage,
          parse_mode: 'Markdown'
        })
      });

      const adminResult = await adminResponse.json();
      if (adminResult.ok) {
        console.log('✅ Summary sent to admin');
      }
    } catch (error) {
      console.error('❌ Error sending summary to admin:', error);
    }

    console.log(`🎉 Premium promotion completed: ${promotedCount} users promoted, ${notificationsSent} notifications sent`);

    return new Response(
      JSON.stringify({
        success: true,
        promotedCount,
        notificationsSent,
        errors: errors.slice(0, 10),
        message: testMode 
          ? 'Test promotion completed successfully' 
          : `Successfully promoted ${promotedCount} users to premium`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Premium promotion error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to promote users to premium'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
