
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EngagementUser {
  telegram_id: number;
  first_name: string;
  last_login?: string;
  created_at: string;
  has_inventory: boolean;
  days_since_signup: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Starting user engagement monitoring...');

    // Find users who need engagement
    const usersNeedingGuidance = await findUsersNeedingGuidance(supabase);
    
    if (usersNeedingGuidance.length === 0) {
      console.log('✅ No users need engagement at this time');
      return new Response(
        JSON.stringify({ success: true, message: 'No users need engagement' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send engagement messages
    const results = await sendEngagementMessages(usersNeedingGuidance);

    console.log(`✅ Engagement campaign completed. Sent ${results.successful} messages, ${results.failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Engagement messages sent to ${results.successful} users`,
        stats: results,
        users_contacted: usersNeedingGuidance.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in user engagement monitoring:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function findUsersNeedingGuidance(supabase: any): Promise<EngagementUser[]> {
  console.log('🔍 Looking for users who need guidance...');

  // Get users who signed up but haven't uploaded inventory
  const { data: usersWithoutInventory, error } = await supabase
    .from('user_profiles')
    .select(`
      telegram_id,
      first_name,
      last_login,
      created_at,
      inventory!left(id)
    `)
    .is('inventory.id', null)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .limit(50);

  if (error) {
    console.error('❌ Error fetching users without inventory:', error);
    return [];
  }

  // Also get users who have very little inventory and haven't been active
  const { data: inactiveUsers, error: inactiveError } = await supabase
    .from('user_profiles')
    .select(`
      telegram_id,
      first_name,
      last_login,
      created_at,
      inventory!left(id)
    `)
    .lt('last_login', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .limit(25);

  if (inactiveError) {
    console.warn('⚠️ Could not fetch inactive users:', inactiveError);
  }

  // Combine and process users
  const allUsers = [...(usersWithoutInventory || []), ...(inactiveUsers || [])];
  const uniqueUsers = allUsers.reduce((acc: EngagementUser[], user: any) => {
    if (!acc.find(u => u.telegram_id === user.telegram_id)) {
      const daysSinceSignup = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      acc.push({
        telegram_id: user.telegram_id,
        first_name: user.first_name || 'User',
        last_login: user.last_login,
        created_at: user.created_at,
        has_inventory: user.inventory && user.inventory.length > 0,
        days_since_signup: daysSinceSignup
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
      const message = generateEngagementMessage(user);
      const keyboard = createEngagementKeyboard(user);

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
        const errorText = await response.text();
        console.error(`❌ Failed to send message to user ${user.telegram_id}:`, errorText);
      }
    } catch (error) {
      failed++;
      console.error(`❌ Error sending message to user ${user.telegram_id}:`, error);
    }
  }

  return { successful, failed };
}

function generateEngagementMessage(user: EngagementUser): string {
  const firstName = user.first_name || 'there';
  const isNewUser = user.days_since_signup <= 1;
  const isRecentUser = user.days_since_signup <= 3;
  
  if (isNewUser && !user.has_inventory) {
    return `היי ${firstName}! 👋

ברוכים הבאים למערכת ניהול היהלומים! 💎

ראיתי שהירשמת אבל עדיין לא העלית יהלומים. בואו נתחיל יחד!

🎯 *המדריך שלנו יעזור לך:*
• להעלות את היהלום הראשון בקלות
• לנהל מלאי בצורה מקצועית
• להגיע ללקוחות חדשים

זה לוקח רק כמה דקות! ✨`;
  }

  if (isRecentUser && !user.has_inventory) {
    return `שלום ${firstName}! 💎

שמחים שאתה כאן! ראיתי שעדיין לא העלית יהלומים למערכת.

🔥 *למה כדאי להתחיל עכשיו?*
• מערכת חכמה לניהול מלאי
• חזית חנות מקצועית ללקוחות
• כלי שיתוף מתקדמים

המדריך שלנו ילווה אותך שלב אחר שלב! 🚀`;
  }

  return `היי ${firstName}! 👋

מתגעגעים אליך במערכת ניהול היהלומים! 💎

${!user.has_inventory ? 
  'ראיתי שעדיין לא העלית יהלומים. בואו נתחיל!' : 
  'זמן לעדכן את המלאי ולהוסיף יהלומים חדשים!'}

🎯 *המערכת שלנו מציעה:*
• העלאה קלה של יהלומים
• ניהול מלאי מקצועי
• חזית חנות יפה ללקוחות

בואו נעשה את זה יחד! ✨`;
}

function createEngagementKeyboard(user: EngagementUser) {
  const baseUrl = Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com';
  
  return {
    inline_keyboard: [
      [
        {
          text: "🎓 התחל מדריך",
          web_app: {
            url: `${baseUrl}/?tutorial=start&onboarding=true&user_id=${user.telegram_id}`
          }
        }
      ],
      [
        {
          text: "📸 העלה יהלום",
          web_app: {
            url: `${baseUrl}/upload-single-stone?tutorial=active&step=upload`
          }
        }
      ],
      [
        {
          text: "🏪 צפה בחנות",
          web_app: {
            url: `${baseUrl}/store`
          }
        }
      ]
    ]
  };
}
