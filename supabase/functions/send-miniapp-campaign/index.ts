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
    
    console.log(testMode ? '🧪 Starting test mini app campaign to admin' : '📢 Starting mini app campaign to all clients');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    let eligibleUsers: UserProfile[] = [];
    let blockedCount = 0;
    
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

    // Get bot username for mini app URL
    const botInfo = await fetch(`https://api.telegram.org/bot${botToken}/getMe`).then(r => r.json());
    const botUsername = botInfo.result?.username || 'diamondmazalbot';

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Send messages in batches to avoid rate limits
    for (const user of eligibleUsers) {
      try {
        const firstName = user.first_name || 'User';
        
        const message = `שלום ${firstName}! 💎

📲 ברוכים הבאים לתפריט הדיגיטלי שלנו

לחצו על הכפתורים למטה לגישה מהירה:

✨ פתחו את התפריט המלא
📁 ייצור SFTP
📞 צרו קשר`;

        // Mini app inline keyboard with web_app buttons
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: '✨ פתחו את התפריט',
                web_app: { url: `https://miniapp.mazalbot.com/` }
              }
            ],
            [
              {
                text: '📁 ייצור SFTP',
                url: `https://t.me/${botUsername}?start=generate_sftp`
              }
            ],
            [
              {
                text: '📞 צור קשר איתי',
                url: `https://wa.me/972548081663`
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
        campaign: 'mini_app_direct',
        total_users: eligibleUsers.length,
        success: successCount,
        failed: failureCount,
        blocked_excluded: blockedCount,
        test_mode: testMode
      }
    });

    console.log(`📊 Campaign complete: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          total_users: eligibleUsers.length,
          messages_sent: successCount,
          messages_failed: failureCount,
          blocked_users_excluded: blockedCount,
          bot_username: botUsername
        },
        errors: errors.slice(0, 10) // Return first 10 errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Mini app campaign error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
