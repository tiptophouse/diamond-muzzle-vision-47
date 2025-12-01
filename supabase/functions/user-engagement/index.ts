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
  language_code?: string;
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
      language_code,
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
        has_diamonds: user.inventory && user.inventory.length > 0,
        language_code: user.language_code || 'he' // Default to Hebrew if not specified
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
      // Check if user uses English or default to Hebrew
      const isEnglish = user.language_code?.startsWith('en') || false;
      
      const message = generatePersonalizedMessage(user, isEnglish);
      const keyboard = {
        inline_keyboard: [[
          {
            text: isEnglish ? "📸 Upload My First Diamond" : "📸 העלאת היהלום הראשון שלי",
            web_app: {
              url: `${Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com'}/upload-single-stone`
            }
          }
        ], [
          {
            text: isEnglish ? "🏪 Browse Diamond Store" : "🏪 לעיין בחנות היהלומים",
            web_app: {
              url: `${Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com'}/store`
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

function generatePersonalizedMessage(user: EngagementUser, isEnglish: boolean = false): string {
  const firstName = user.first_name || (isEnglish ? 'there' : 'שלום');
  const isNewUser = new Date(user.created_at) > new Date(Date.now() - 48 * 60 * 60 * 1000); // Less than 48 hours old
  
  if (isNewUser && !user.has_diamonds) {
    if (isEnglish) {
      return `
Hi ${firstName}! 👋

Welcome to the Diamond Market! We noticed you just joined but haven't uploaded your first diamond yet. 

💎 *Get started in seconds:*
• Upload your first diamond with just a photo
• Join thousands of diamond traders
• Start showcasing your inventory today

Ready to sparkle? ✨
      `;
    } else {
      return `
שלום ${firstName}! 👋

ברוכים הבאים לשוק היהלומים! שמנו לב שהצטרפת לאחרונה אך עדיין לא העלית את היהלום הראשון שלך.

💎 *התחל/י בשניות:*
• העלה/י את היהלום הראשון שלך עם תמונה בלבד
• הצטרף/י לאלפי סוחרי יהלומים
• התחל/י להציג את המלאי שלך כבר היום

מוכן/ה להתחיל? ✨
      `;
    }
  }

  if (!user.has_diamonds) {
    if (isEnglish) {
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
    } else {
      return `
שלום ${firstName}! 💎

חשבון שוק היהלומים שלך מוכן, אבל הוא נראה קצת ריק. הגיע הזמן להוסיף קצת נצנוץ!

🌟 *למה להעלות את היהלומים שלך?*
• הגעה ללקוחות פוטנציאליים ברחבי העולם
• כלי הצגה מקצועיים
• ניתוח ותובנות חכמות
• ללא עמלות רישום

בוא/י נעלה את היהלום הראשון שלך! 📸
      `;
    }
  }

  if (isEnglish) {
    return `
Hi ${firstName}! 👋

We miss seeing you in the Diamond Market! Your inventory could be reaching more buyers right now.

💼 *Quick actions you can take:*
• Add new diamonds to your collection
• Update prices on existing inventory
• Check out what's trending in the market

Your next big sale might be just one upload away! 🎯
    `;
  } else {
    return `
שלום ${firstName}! 👋

מתגעגעים לראות אותך בשוק היהלומים! המלאי שלך יכול להגיע ליותר קונים כרגע.

💼 *פעולות מהירות שתוכל/י לבצע:*
• הוסף/י יהלומים חדשים לאוסף שלך
• עדכן/י מחירים במלאי הקיים
• בדוק/י מה המגמות בשוק

המכירה הגדולה הבאה שלך עשויה להיות במרחק העלאה אחת בלבד! 🎯
    `;
  }
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