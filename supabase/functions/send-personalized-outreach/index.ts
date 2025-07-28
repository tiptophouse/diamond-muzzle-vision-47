
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  created_at: string;
  language_code?: string;
  diamond_count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_ids, calendar_link } = await req.json();
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user data
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('telegram_id, first_name, last_name, created_at, language_code')
      .in('telegram_id', user_ids);

    if (usersError) throw usersError;

    // Get diamond counts for each user
    const usersWithData = await Promise.all(
      (users || []).map(async (user) => {
        const { data: diamonds } = await supabase
          .from('inventory')
          .select('id')
          .eq('user_id', user.telegram_id)
          .is('deleted_at', null);

        return {
          ...user,
          diamond_count: diamonds?.length || 0
        };
      })
    );

    const results = [];

    for (const user of usersWithData) {
      try {
        const message = generatePersonalizedMessage(user, calendar_link);
        const keyboard = createMeetingKeyboard(calendar_link);

        console.log(`📤 Sending personalized message to ${user.first_name} (${user.telegram_id})`);

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
          results.push({ telegram_id: user.telegram_id, success: true });
          console.log(`✅ Message sent successfully to ${user.first_name}`);
          
          // Notify admin about meeting scheduling
          await notifyAdminAboutOutreach(botToken, user, calendar_link);
        } else {
          const errorText = await response.text();
          console.error(`❌ Failed to send message to ${user.telegram_id}:`, errorText);
          results.push({ telegram_id: user.telegram_id, success: false, error: errorText });
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Error sending to ${user.telegram_id}:`, error);
        results.push({ telegram_id: user.telegram_id, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Outreach campaign completed: ${successful} sent, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `נשלחו ${successful} הודעות מותאמות אישית`,
      results: { successful, failed, details: results }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in personalized outreach:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePersonalizedMessage(user: UserData, calendarLink: string): string {
  const daysSinceJoined = Math.floor(
    (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const firstName = user.first_name || 'משתמש';
  
  if (daysSinceJoined <= 3 && user.diamond_count === 0) {
    // Recent joiner, no diamonds
    return `שלום ${firstName} 👋

ראיתי שהצטרפת לאחרונה למערכת ניהול היהלומים שלנו - ברוך הבא!

🎯 **אני כאן לעזור לך אישית**

אנחנו סטארט-אפ שמנסה להבין לעומק את תעשיית היהלומים, והמשוב שלך זה זהב עבורנו.

**המערכת שלנו מאפשרת:**
• העלאת מלאי יהלומים בקלות ובמהירות
• ניהול מקצועי של המלאי שלך
• חזית חנות יפה ללקוחות
• כלי שיתוף מתקדמים ואנליטיקה

❓ **יש לי כמה שאלות מהירות:**
• מה הקשיים שאתה חווה עם העלאת המלאי?
• איך אני יכול לעזור לך להתחיל?
• מה החסר במערכת הנוכחית?

📅 **בוא נדבר אישית!**
קבע פגישה קצרה איתי (10-15 דקות) ואני אסביר לך בדיוק איך המערכת עובדת ואיך היא יכולה לעזור לעסק שלך.

המשוב שלך יעזור לנו לבנות משהו מדהים עבור תעשיית היהלומים! 💎

בברכה,
המייסד של המערכת`;
  } else if (user.language_code?.startsWith('he') || user.first_name.match(/[\u0590-\u05FF]/)) {
    // Hebrew speaker
    return `שלום ${firstName}! 🇮🇱

שמחתי לראות שהצטרפת למערכת ניהול היהלומים שלנו!

כמייסד הסטארט-אפ הזה, אני מנסה להבין מה הכי חסר לסוחרי יהלומים בישראל.

**המערכת הנוכחית מציעה:**
• סריקת תעודות יהלומים אוטומטית
• ניהול מלאי חכם ומקצועי  
• חנות וירטואלית ללקוחות
• כלי אנליטיקה מתקדמים

💭 **אני רוצה להבין:**
• איך אתה מנהל מלאי כרגע?
• מה הכי מעצבן אותך בתהליך הנוכחי?
• איך המערכת יכולה לחסוך לך זמן?

🤝 **בוא נעשה זאת יחד!**
אני מזמין אותך לשיחה קצרה (רק 10-15 דקות) שבה אני אראה לך בדיוק איך המערכת עובדת ואיך להעלות את היהלום הראשון.

יחד נבנה את הכלי הטוב ביותר לתעשיית היהלומים! 🚀

בהערכה,
המייסד של המערכת`;
  } else {
    // Established user
    return `שלום ${firstName}, 🎩

אני מכיר את השם שלך בתעשייה ונרגש שהצטרפת למערכת שלנו!

כמישהו מנוסה בתחום, המשוב שלך חשוב לי במיוחד.

**המערכת מתמחה ב:**
• דיגיטציה מלאה של תהליכי המלאי
• אוטומציה של משימות יומיומיות
• שיפור חוויית הלקוח הקצה
• נתונים ותובנות עסקיות

🎯 **השאלות שלי אליך:**
• מה הכי מאתגר בניהול מלאי דיגיטלי?
• איך אפשר לעשות את התהליך יותר יעיל?
• מה הפיצ'ר החסר שהכי היית רוצה?

📞 **שיחת ייעוץ מקצועית**
אני מזמין אותך לשיחה איכותית (15-20 דקות) שבה נדבר על החזון של המערכת ואיך היא יכולה לשרת את הצרכים המקצועיים שלך.

יחד נעצב את עתיד ניהול היהלומים! 💎

בכבוד רב,
המייסד`;
  }
}

function createMeetingKeyboard(calendarLink: string) {
  return {
    inline_keyboard: [
      [
        {
          text: "📅 קבע פגישה איתי (10-15 דקות)",
          url: calendarLink
        }
      ],
      [
        {
          text: "💎 עבור למערכת",
          web_app: {
            url: Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com'
          }
        }
      ],
      [
        {
          text: "📞 צור קשר ישיר",
          url: "https://t.me/DiamondMazalVision"
        }
      ]
    ]
  };
}

async function notifyAdminAboutOutreach(botToken: string, user: UserData, calendarLink: string) {
  const adminId = 2138564172; // Your telegram ID
  
  const adminMessage = `🚀 **הודעה אישית נשלחה ל${user.first_name}**

👤 **פרטי המשתמש:**
• שם: ${user.first_name} ${user.last_name || ''}
• טלגרם ID: ${user.telegram_id}
• הצטרף: ${new Date(user.created_at).toLocaleDateString('he-IL')}
• יהלומים במערכת: ${user.diamond_count}

📅 **קישור לתיאום פגישות:**
${calendarLink}

אם המשתמש יקבע פגישה, תקבל התראה!`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminId,
        text: adminMessage,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
}
