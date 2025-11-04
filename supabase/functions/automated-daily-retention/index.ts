import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserSegment {
  telegram_id: number;
  first_name: string;
  is_paying: boolean;
  has_inventory: boolean;
  days_since_signup: number;
  notifications_today: number;
  total_value_today: number;
}

serve(async (req) => {
  console.log('🤖 Automated daily retention system triggered');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!botToken) {
      throw new Error('Bot token not configured');
    }

    // Fetch payment status from FastAPI
    const fastApiUrl = 'https://acadia.diamondmazalbot.workers.dev/api/v1/payment-status';
    const paymentResponse = await fetch(fastApiUrl);
    const paymentData = await paymentResponse.json();
    const payingUsers = new Set(paymentData.paying_users || []);

    console.log(`💰 Found ${payingUsers.size} paying users`);

    // Get all users and segment them
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const { data: allUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('telegram_id, first_name, created_at')
      .not('telegram_id', 'is', null);

    if (usersError || !allUsers) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`👥 Processing ${allUsers.length} users`);

    const segments: {
      newUsers: UserSegment[],
      noInventory: UserSegment[],
      withInventoryPaying: UserSegment[],
      withInventoryFree: UserSegment[]
    } = {
      newUsers: [],
      noInventory: [],
      withInventoryPaying: [],
      withInventoryFree: []
    };

    // Process each user
    for (const user of allUsers) {
      const isPaying = payingUsers.has(user.telegram_id);
      const daysSinceSignup = Math.floor(
        (today.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get inventory count
      const { count: inventoryCount } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.telegram_id)
        .is('deleted_at', null);

      const hasInventory = (inventoryCount || 0) > 0;

      // Get today's notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('metadata')
        .eq('telegram_id', user.telegram_id)
        .gte('created_at', `${todayStr}T00:00:00.000Z`);

      const notificationsToday = notifications?.length || 0;
      
      // Calculate total value of matched diamonds today
      let totalValueToday = 0;
      if (notifications) {
        notifications.forEach(notif => {
          if (notif.metadata?.matches) {
            notif.metadata.matches.forEach((diamond: any) => {
              totalValueToday += diamond.total_price || 0;
            });
          }
        });
      }

      const userSegment: UserSegment = {
        telegram_id: user.telegram_id,
        first_name: user.first_name,
        is_paying: isPaying,
        has_inventory: hasInventory,
        days_since_signup: daysSinceSignup,
        notifications_today: notificationsToday,
        total_value_today: totalValueToday
      };

      // Segment users
      if (daysSinceSignup === 0) {
        segments.newUsers.push(userSegment);
      } else if (!hasInventory && daysSinceSignup >= 1 && daysSinceSignup <= 4) {
        segments.noInventory.push(userSegment);
      } else if (hasInventory && isPaying) {
        segments.withInventoryPaying.push(userSegment);
      } else if (hasInventory && !isPaying) {
        segments.withInventoryFree.push(userSegment);
      }
    }

    console.log(`📊 Segmentation complete:
    - New users: ${segments.newUsers.length}
    - No inventory (1-4 days): ${segments.noInventory.length}
    - With inventory (Paying): ${segments.withInventoryPaying.length}
    - With inventory (Free): ${segments.withInventoryFree.length}`);

    const results = {
      newUsers: 0,
      noInventory: 0,
      dailyReportsPaying: 0,
      dailyReportsFree: 0,
      errors: 0
    };

    // Send messages to each segment
    for (const user of segments.newUsers) {
      try {
        await sendOnboardingMessage(botToken, user);
        results.newUsers++;
        await delay(100);
      } catch (error) {
        console.error(`❌ Failed to send to new user ${user.telegram_id}:`, error);
        results.errors++;
      }
    }

    for (const user of segments.noInventory) {
      try {
        await sendInventoryReminderMessage(botToken, user);
        results.noInventory++;
        await delay(100);
      } catch (error) {
        console.error(`❌ Failed to send to no-inventory user ${user.telegram_id}:`, error);
        results.errors++;
      }
    }

    for (const user of segments.withInventoryPaying) {
      try {
        await sendDailyReportPaying(botToken, user, supabase);
        results.dailyReportsPaying++;
        await delay(100);
      } catch (error) {
        console.error(`❌ Failed to send to paying user ${user.telegram_id}:`, error);
        results.errors++;
      }
    }

    for (const user of segments.withInventoryFree) {
      try {
        await sendDailyReportFree(botToken, user, supabase);
        results.dailyReportsFree++;
        await delay(100);
      } catch (error) {
        console.error(`❌ Failed to send to free user ${user.telegram_id}:`, error);
        results.errors++;
      }
    }

    console.log('✅ Retention campaign complete:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in retention system:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendOnboardingMessage(botToken: string, user: UserSegment) {
  const message = `👋 שלום ${user.first_name}!

ברוך הבא לדיאמונד מזל - הפלטפורמה המתקדמת למסחר ביהלומים! 💎

🎯 מה תוכל לעשות כאן:
• העלה את המלאי שלך בקלות
• קבל התאמות אוטומטיות ללקוחות מעוניינים
• נהל את היהלומים שלך במקום אחד
• שתף יהלומים עם לקוחות ב-1 קליק

💡 *הצעד הראשון שלך:*
העלה את המלאי הראשון שלך והתחל לקבל התאמות!

בהצלחה! 🚀`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user.telegram_id,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📤 העלה מלאי', web_app: { url: 'https://t.me/diamondmazalbot?startapp=upload' } }],
          [{ text: '📚 מדריך שימוש', web_app: { url: 'https://t.me/diamondmazalbot?startapp=tutorial' } }]
        ]
      }
    })
  });
}

async function sendInventoryReminderMessage(botToken: string, user: UserSegment) {
  const message = `היי ${user.first_name}! 👋

שמנו לב שעדיין לא העלת את המלאי שלך... 

⏰ זה לוקח רק 2 דקות והמערכת תתחיל לעבוד בשבילך:

✅ התאמות אוטומטיות ללקוחות
✅ התראות בזמן אמת
✅ ניהול מלאי חכם

💎 יש לך יהלומים? הגיע הזמן למכור אותם!`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user.telegram_id,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📤 העלה מלאי עכשיו', web_app: { url: 'https://t.me/diamondmazalbot?startapp=upload' } }],
          [{ text: '💬 צריך עזרה?', url: 'https://t.me/yoursupport' }]
        ]
      }
    })
  });
}

async function sendDailyReportPaying(botToken: string, user: UserSegment, supabase: any) {
  if (user.notifications_today === 0) {
    return; // Don't send if no activity today
  }

  // Get detailed notification data
  const today = new Date().toISOString().split('T')[0];
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('telegram_id', user.telegram_id)
    .gte('created_at', `${today}T00:00:00.000Z`)
    .order('created_at', { ascending: false });

  // Extract diamond details with images
  const diamonds: any[] = [];
  const buyers: Set<string> = new Set();
  
  if (notifications) {
    notifications.forEach((notif: any) => {
      if (notif.metadata?.matches) {
        notif.metadata.matches.forEach((diamond: any) => {
          diamonds.push(diamond);
        });
      }
      if (notif.metadata?.buyer_name) {
        buyers.add(notif.metadata.buyer_name);
      }
    });
  }

  const uniqueBuyers = buyers.size;
  const message = `🎯 *דו"ח יומי - ${new Date().toLocaleDateString('he-IL')}*

היי ${user.first_name}! 💎

📊 *הסיכום שלך להיום:*
🔔 ${user.notifications_today} התראות חדשות
👥 ${uniqueBuyers} לקוחות מעוניינים
💰 סה"כ ערך עסקאות: $${user.total_value_today.toLocaleString()}

${diamonds.length > 0 ? `*🌟 היהלומים הפופולריים שלך:*\n${diamonds.slice(0, 3).map((d: any, i: number) => 
  `${i + 1}. ${d.shape} ${d.weight}ct ${d.color}/${d.clarity} - $${d.total_price?.toLocaleString() || 'N/A'}`
).join('\n')}\n` : ''}

💡 *כמנוי פרימיום שלנו:*
• התאמות בזמן אמת ⚡
• גישה ללקוחות VIP 👑
• ניתוח מתקדם 📊

_לחץ להצגת הפרטים המלאים ושליחת הצעות מחיר ללקוחות_ 👇`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user.telegram_id,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📱 פתח דשבורד', web_app: { url: 'https://t.me/diamondmazalbot?startapp=dashboard' } }],
          [{ text: '🔔 צפה בהתראות', web_app: { url: 'https://t.me/diamondmazalbot?startapp=notifications' } }]
        ]
      }
    })
  });

  // Save the daily report record
  await supabase
    .from('daily_summaries')
    .insert({
      telegram_id: user.telegram_id,
      summary_date: today,
      notifications_count: user.notifications_today,
      unique_diamonds: diamonds.length,
      summary_data: {
        total_value: user.total_value_today,
        unique_buyers: uniqueBuyers,
        diamonds: diamonds.slice(0, 5)
      }
    });
}

async function sendDailyReportFree(botToken: string, user: UserSegment, supabase: any) {
  if (user.notifications_today === 0) {
    return; // Don't send if no activity today
  }

  const message = `📊 *דו"ח יומי - ${new Date().toLocaleDateString('he-IL')}*

היי ${user.first_name}!

🔔 קיבלת ${user.notifications_today} התראות חדשות היום
💰 סה"כ ערך עסקאות פוטנציאליות: $${user.total_value_today.toLocaleString()}

🚀 *שדרג לפרימיום וקבל:*
• ניתוח מתקדם של הלקוחות שלך
• עדיפות בהתאמות
• פרטי יצירת קשר מלאים של לקוחות
• תמיכה VIP

💎 למכירות מקסימליות - שדרג עכשיו!`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user.telegram_id,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔔 צפה בהתראות', web_app: { url: 'https://t.me/diamondmazalbot?startapp=notifications' } }],
          [{ text: '👑 שדרג לפרימיום', web_app: { url: 'https://t.me/diamondmazalbot?startapp=upgrade' } }]
        ]
      }
    })
  });
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
