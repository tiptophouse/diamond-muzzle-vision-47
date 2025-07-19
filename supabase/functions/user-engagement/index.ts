import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EngagementUser {
  telegram_id: number;
  first_name: string;
  last_active?: string;
  created_at: string;
  has_diamonds: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find users who haven't uploaded diamonds
    const inactiveUsers = await findInactiveUsers(supabase);
    
    // Send engagement messages
    const results = await sendEngagementMessages(inactiveUsers);

    console.log(`✅ Engagement campaign completed. Sent ${results.successful} messages, ${results.failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Engagement messages sent to ${results.successful} users`,
        stats: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in user engagement campaign:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function findInactiveUsers(supabase: any): Promise<EngagementUser[]> {
  // Get users who registered more than 24 hours ago but haven't uploaded diamonds
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: usersWithoutDiamonds, error } = await supabase
    .from('user_profiles')
    .select(`
      telegram_id,
      first_name,
      last_active,
      created_at,
      inventory!left(id)
    `)
    .lt('created_at', oneDayAgo.toISOString())
    .is('inventory.id', null) // Users with no diamonds
    .limit(50); // Limit to avoid spam

  if (error) {
    console.error('❌ Error fetching inactive users:', error);
    return [];
  }

  // Also find users who haven't been active in the last 7 days but have < 5 diamonds
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: lowEngagementUsers, error: lowEngagementError } = await supabase
    .rpc('get_low_engagement_users', {
      days_inactive: 7,
      max_diamonds: 5
    });

  if (lowEngagementError) {
    console.warn('⚠️ Could not fetch low engagement users:', lowEngagementError);
  }

  // Combine and deduplicate users
  const allUsers = [...(usersWithoutDiamonds || []), ...(lowEngagementUsers || [])];
  const uniqueUsers = allUsers.reduce((acc: EngagementUser[], user: any) => {
    if (!acc.find(u => u.telegram_id === user.telegram_id)) {
      acc.push({
        telegram_id: user.telegram_id,
        first_name: user.first_name || 'User',
        last_active: user.last_active,
        created_at: user.created_at,
        has_diamonds: user.inventory && user.inventory.length > 0
      });
    }
    return acc;
  }, []);

  console.log(`🎯 Found ${uniqueUsers.length} users for engagement campaign`);
  return uniqueUsers;
}

async function sendEngagementMessages(users: EngagementUser[]): Promise<{successful: number, failed: number}> {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  if (!botToken) {
    console.warn('⚠️ No Telegram bot token configured');
    return { successful: 0, failed: 0 };
  }

  let successful = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const message = generatePersonalizedMessage(user);
      const keyboard = {
        inline_keyboard: [[
          {
            text: "📸 Upload My First Diamond",
            web_app: {
              url: `${Deno.env.get('WEB_APP_URL') || 'https://your-app.lovable.app'}/upload-single-stone`
            }
          }
        ], [
          {
            text: "🏪 Browse Diamond Store",
            web_app: {
              url: `${Deno.env.get('WEB_APP_URL') || 'https://your-app.lovable.app'}/store`
            }
          }
        ]]
      };

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: keyboard
        })
      });

      if (response.ok) {
        successful++;
        console.log(`✅ Engagement message sent to user ${user.telegram_id}`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        failed++;
        console.error(`❌ Failed to send message to user ${user.telegram_id}:`, await response.text());
      }
    } catch (error) {
      failed++;
      console.error(`❌ Error sending message to user ${user.telegram_id}:`, error);
    }
  }

  return { successful, failed };
}

function generatePersonalizedMessage(user: EngagementUser): string {
  const firstName = user.first_name || 'there';
  const isNewUser = new Date(user.created_at) > new Date(Date.now() - 48 * 60 * 60 * 1000); // Less than 48 hours old
  
  if (isNewUser && !user.has_diamonds) {
    return `
Hi ${firstName}! 👋

Welcome to the Diamond Market! We noticed you just joined but haven't uploaded your first diamond yet. 

💎 *Get started in seconds:*
• Upload your first diamond with just a photo
• Join thousands of diamond traders
• Start showcasing your inventory today

Ready to sparkle? ✨
    `;
  }

  if (!user.has_diamonds) {
    return `
Hi ${firstName}! 💎

Your Diamond Market account is ready, but it's looking a bit empty. Time to add some sparkle! 

🌟 *Why upload your diamonds?*
• Reach global buyers instantly
• Professional presentation tools
• Smart analytics & insights
• Zero listing fees

Let's get your first diamond online! 📸
    `;
  }

  return `
Hi ${firstName}! 👋

We miss seeing you in the Diamond Market! Your inventory could be reaching more buyers right now.

💼 *Quick actions you can take:*
• Add new diamonds to your collection
• Update prices on existing inventory
• Check out what's trending in the market

Your next big sale might be just one upload away! 🎯
  `;
}

// Helper function to be created in Supabase as a database function
/*
CREATE OR REPLACE FUNCTION get_low_engagement_users(days_inactive integer, max_diamonds integer)
RETURNS TABLE(
  telegram_id bigint,
  first_name text,
  last_active timestamp with time zone,
  created_at timestamp with time zone,
  diamond_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.telegram_id,
    up.first_name,
    up.last_active,
    up.created_at,
    COUNT(inv.id) as diamond_count
  FROM user_profiles up
  LEFT JOIN inventory inv ON up.telegram_id = inv.user_id AND inv.deleted_at IS NULL
  WHERE 
    up.last_active < NOW() - INTERVAL '1 day' * days_inactive
    OR up.last_active IS NULL
  GROUP BY up.telegram_id, up.first_name, up.last_active, up.created_at
  HAVING COUNT(inv.id) <= max_diamonds
  ORDER BY up.last_active ASC NULLS FIRST
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
*/