import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testMode } = await req.json().catch(() => ({ testMode: false }));
    
    console.log(testMode ? '🧪 Starting test message to admin' : '📢 Starting bulk payment reminder campaign');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    const backendToken = Deno.env.get('FASTAPI_BEARER_TOKEN') || Deno.env.get('BACKEND_ACCESS_TOKEN');
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com';

    let eligibleUsers: UserProfile[] = [];
    let blockedCount = 0;
    let paidUsersSkipped = 0;
    
    if (testMode) {
      // In test mode, get only admin users
      const { data: adminUsers, error: adminError } = await supabaseClient
        .from('admin_roles')
        .select('telegram_id')
        .eq('is_active', true)
        .limit(1);

      if (adminError || !adminUsers?.length) {
        throw new Error('No admin user found for test');
      }

      const { data: adminProfile, error: profileError } = await supabaseClient
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username')
        .eq('telegram_id', adminUsers[0].telegram_id)
        .single();

      if (profileError || !adminProfile) {
        throw new Error('Admin profile not found');
      }

      eligibleUsers = [adminProfile];
      console.log(`🧪 Test mode: Sending to admin only (${adminProfile.telegram_id})`);
    } else {
      // Get all users from user_profiles
      const { data: users, error: usersError } = await supabaseClient
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username')
        .not('telegram_id', 'is', null);

      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        throw usersError;
      }

      console.log(`👥 Found ${users?.length || 0} users to message`);

      // Get blocked users to exclude
      const { data: blockedUsers } = await supabaseClient
        .from('blocked_users')
        .select('telegram_id');

      const blockedIds = new Set(blockedUsers?.map(b => b.telegram_id) || []);
      eligibleUsers = users?.filter(u => !blockedIds.has(u.telegram_id)) || [];
      blockedCount = blockedIds.size;

      console.log(`✅ ${eligibleUsers.length} eligible users (${blockedCount} blocked)`);
    }

    const botUsername = (await fetch(`https://api.telegram.org/bot${botToken}/getMe`).then(r => r.json())).result?.username || 'bot';
    const startLink = `https://t.me/${botUsername}?start=payment_reminder`;

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Send messages in batches to avoid rate limits
    for (const user of eligibleUsers) {
      try {
        // Check subscription status before sending
        if (backendToken) {
          try {
            const subResponse = await fetch(`${backendUrl}/api/v1/user/active-subscription`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${backendToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ user_id: user.telegram_id })
            });

            if (subResponse.ok) {
              const subData = await subResponse.json();
              if (subData.is_active) {
                console.log(`⏭️ Skipping paid user ${user.telegram_id} (${subData.subscription_type})`);
                paidUsersSkipped++;
                continue; // Skip paid users
              }
            }
          } catch (subError) {
            console.warn(`⚠️ Could not check subscription for ${user.telegram_id}, will send message`);
          }
        }

        const firstName = user.first_name || 'User';
        
        const message = `היי ${firstName}! 💎

🔔 **הודעה חשובה מצוות היהלומים**

כדי להמשיך להשתמש בפלטפורמה ולקבל גישה מלאה לכל התכונות, נדרש תשלום חודשי.

💰 **מה תקבל:**
• גישה מלאה למלאי היהלומים
• שיתוף יהלומים בקבוצות
• התאמות אוטומטיות לקונים
• דוחות שוק יומיים
• תמיכה מלאה

👇 **לחץ כאן להתחלה:**`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: '💳 לתשלום והפעלה',
                url: startLink
              }
            ],
            [
              {
                text: '📞 צור קשר לשאלות',
                url: `tg://user?id=2138564172`
              }
            ]
          ]
        };

        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: message,
              parse_mode: 'Markdown',
              reply_markup: keyboard,
            }),
          }
        );

        const result = await response.json();

        if (result.ok) {
          successCount++;
          console.log(`✅ Sent to ${user.telegram_id} (${firstName})`);
          
          // Small delay to avoid rate limits (30 messages per second)
          await new Promise(resolve => setTimeout(resolve, 35));
        } else {
          failureCount++;
          const errorMsg = `User ${user.telegram_id}: ${result.description}`;
          errors.push(errorMsg);
          console.error(`❌ Failed: ${errorMsg}`);
        }
      } catch (error) {
        failureCount++;
        const errorMsg = `User ${user.telegram_id}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ Error sending to user:`, errorMsg);
      }
    }

    // Log campaign results to database
    await supabaseClient.from('bot_usage_analytics').insert({
      telegram_id: 2138564172, // Admin
      chat_id: 2138564172,
      message_type: 'campaign',
      chat_type: 'bulk',
      message_data: {
        campaign: 'payment_reminder',
        total_users: eligibleUsers.length,
        success: successCount,
        failed: failureCount,
        blocked_excluded: blockedCount,
        paid_users_skipped: paidUsersSkipped,
        test_mode: testMode
      }
    });

    console.log(`📊 Campaign complete: ${successCount} sent, ${failureCount} failed, ${paidUsersSkipped} paid users skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          total_users: eligibleUsers.length,
          messages_sent: successCount,
          messages_failed: failureCount,
          blocked_users_excluded: blockedCount,
          paid_users_skipped: paidUsersSkipped,
          unpaid_users_targeted: successCount,
          start_link: startLink
        },
        errors: errors.slice(0, 10) // Return first 10 errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Bulk campaign error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
