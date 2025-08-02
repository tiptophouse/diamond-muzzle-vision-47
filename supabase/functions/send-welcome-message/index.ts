
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface User {
  telegram_id: number;
  first_name: string;
  language_code?: string;
}

interface RequestBody {
  user: User;
  isNewUser?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, isNewUser = true }: RequestBody = await req.json();
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    console.log(`📤 Sending comprehensive welcome message to user ${user.telegram_id} (${user.first_name})`);

    // Determine language - default to Hebrew unless specifically English
    const isEnglish = user.language_code?.startsWith('en') || false;
    
    // Generate the comprehensive welcome message
    const message = generateComprehensiveWelcomeMessage(user.first_name, isEnglish);
    
    // Create the 4-button keyboard
    const keyboard = createMainFeatureKeyboard(isEnglish);

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: user.telegram_id,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard,
        disable_web_page_preview: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send comprehensive welcome message: ${errorData}`);
    }

    console.log(`✅ Comprehensive welcome message sent successfully to ${user.first_name} (${user.telegram_id})`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Comprehensive welcome message sent successfully'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Error in send-welcome-message:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send comprehensive welcome message',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function generateComprehensiveWelcomeMessage(firstName: string, isEnglish: boolean = false): string {
  if (isEnglish) {
    return `🎉 <b>Welcome to Diamond Muzzle, ${firstName}!</b>

💎 <b>You've joined the world's most advanced diamond trading platform!</b>

🔍 <b>Smart Group Monitoring 24/7</b>
• We listen to all diamond groups in real-time
• Get instant alerts when someone is looking for exactly your stones
• Never miss a sales opportunity again!

📊 <b>Advanced Inventory Management</b>
• Easy and fast diamond upload from GIA certificates
• Professional storefront for your collection
• Real-time business analytics

🤖 <b>Advanced Artificial Intelligence</b>
• Smart chat with your inventory - ask questions and get instant answers
• Automatic matching between demand and supply
• Smart recommendations to increase profits

💰 <b>Business Growth Tools</b>
• Professional diamond sharing on social networks
• Lead and potential client management
• Performance reports and revenue tracking

🌐 <b>Global Community</b>
• Connect with buyers worldwide
• Multi-language platform
• Secure and professional trading environment

⭐ <b>Get started now in 3 simple steps:</b>
1️⃣ Upload your first diamonds from certificate
2️⃣ Set up your professional store
3️⃣ Start receiving leads and automatic matches

🚀 <b>Ready to transform your diamond business forever?</b>`;
  } else {
    return `🎉 <b>ברוכים הבאים ל-Diamond Muzzle, ${firstName}!</b>

💎 <b>הצטרפת לפלטפורמת המסחר ביהלומים המתקדמת בעולם!</b>

🔍 <b>ניטור קבוצות חכם 24/7</b>
• אנחנו מאזינים לכל קבוצות היהלומים בזמן אמת
• קבל התראות מיידיות כשמישהו מחפש בדיוק את האבנים שלך
• לעולם לא תפספס הזדמנות מכירה!

📊 <b>ניהול מלאי מתקדם</b>
• העלאת יהלומים קלה ומהירה מתעודות GIA
• חזית חנות מקצועית לאוסף שלך
• אנליטיקות עסקיות בזמן אמת

🤖 <b>בינה מלאכותית מתקדמת</b>
• צ'אט חכם עם המלאי שלך - שאל שאלות וקבל תשובות מיידיות
• התאמות אוטומטיות בין ביקוש להיצע
• המלצות חכמות להגדלת הרווחים

💰 <b>כלי צמיחה עסקית</b>
• שיתוף מקצועי של יהלומים ברשתות החברתיות
• ניהול לידים ולקוחות פוטנציאליים
• דוחות ביצועים ומעקב הכנסות

🌐 <b>קהילה גלובלית</b>
• חיבור לקונים ברחבי העולם
• פלטפורמה רב-לשונית
• סביבת עסקאות מאובטחת ומקצועית

⭐ <b>התחל עכשיו ב-3 צעדים פשוטים:</b>
1️⃣ העלה את היהלומים הראשונים מתעודה
2️⃣ הגדר את החנות המקצועית שלך
3️⃣ התחל לקבל לידים והתאמות אוטומטיות

🚀 <b>מוכן לשנות את עסק היהלומים שלך לנצח?</b>`;
  }
}

function createMainFeatureKeyboard(isEnglish: boolean = false) {
  const baseUrl = Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com';
  
  if (isEnglish) {
    return {
      inline_keyboard: [
        [
          {
            text: "📤 Upload from Certificate",
            web_app: {
              url: `${baseUrl}/upload-single-stone`
            }
          },
          {
            text: "🤖 Chat with AI",
            web_app: {
              url: `${baseUrl}/chat`
            }
          }
        ],
        [
          {
            text: "📊 Dashboard",
            web_app: {
              url: `${baseUrl}/dashboard`
            }
          },
          {
            text: "🏪 Store",
            web_app: {
              url: `${baseUrl}/store`
            }
          }
        ]
      ]
    };
  } else {
    return {
      inline_keyboard: [
        [
          {
            text: "📤 העלאה מתעודה",
            web_app: {
              url: `${baseUrl}/upload-single-stone`
            }
          },
          {
            text: "🤖 צ'אט עם AI",
            web_app: {
              url: `${baseUrl}/chat`
            }
          }
        ],
        [
          {
            text: "📊 דשבורד",
            web_app: {
              url: `${baseUrl}/dashboard`
            }
          },
          {
            text: "🏪 חנות",
            web_app: {
              url: `${baseUrl}/store`
            }
          }
        ]
      ]
    };
  }
}
