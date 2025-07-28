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

    console.log(`📤 Sending welcome message to user ${user.telegram_id} (${user.first_name})`);

    // Determine language - default to Hebrew unless specifically English
    const isEnglish = user.language_code?.startsWith('en') || false;
    
    // Generate welcome message in the appropriate language
    const message = generateWelcomeMessage(user.first_name, isEnglish);
    
    // Create comprehensive feature keyboard
    const keyboard = createComprehensiveKeyboard(isEnglish);

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
      throw new Error(`Failed to send welcome message: ${errorData}`);
    }

    console.log(`✅ Welcome message sent successfully to ${user.first_name} (${user.telegram_id})`);

    // Send a follow-up message with tutorial link after a short delay
    setTimeout(async () => {
      try {
        const tutorialMessage = generateTutorialMessage(user.first_name, isEnglish);
        const tutorialKeyboard = createTutorialKeyboard(user.telegram_id, isEnglish);

        await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: user.telegram_id,
            text: tutorialMessage,
            parse_mode: 'HTML',
            reply_markup: tutorialKeyboard
          })
        });

        console.log(`✅ Tutorial message sent to ${user.first_name}`);
      } catch (error) {
        console.error('❌ Failed to send tutorial message:', error);
      }
    }, 3000); // 3 second delay

    return new Response(JSON.stringify({
      success: true,
      message: 'Welcome message sent successfully'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Error in send-welcome-message:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send welcome message',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function generateWelcomeMessage(firstName: string, isEnglish: boolean = false): string {
  if (isEnglish) {
    return `🎉 <b>Welcome to Diamond Muzzle, ${firstName}!</b>

💎 You've joined the most advanced diamond trading platform! Here's what makes us special:

🔍 <b>Smart Group Monitoring</b>
• We listen to diamond groups 24/7
• Get instant alerts when someone needs YOUR exact stones
• Never miss a potential sale again!

📊 <b>Intelligent Inventory Management</b>
• Upload your diamonds easily with photos or certificates
• Professional store front for your collection
• Real-time analytics and insights

🚀 <b>Automated Matching</b>
• Our AI matches client requests to your inventory
• Instant notifications when demand matches your supply
• Smart recommendations for market opportunities

💰 <b>Business Growth Tools</b>
• Professional sharing features
• Client management system
• Revenue tracking and analytics

🌍 <b>Global Reach</b>
• Connect with buyers worldwide
• Multi-language support
• Secure transaction environment

Ready to transform your diamond business? Let's get started! 🚀`;
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

function createComprehensiveKeyboard(isEnglish: boolean = false) {
  const baseUrl = Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com';
  
  if (isEnglish) {
    return {
      inline_keyboard: [
        [
          {
            text: "💎 Upload Diamonds",
            web_app: {
              url: `${baseUrl}/upload-single-stone`
            }
          },
          {
            text: "🏪 View Store",
            web_app: {
              url: `${baseUrl}/store`
            }
          }
        ],
        [
          {
            text: "🤖 AI Assistant",
            web_app: {
              url: `${baseUrl}/chat`
            }
          },
          {
            text: "📊 Analytics",
            web_app: {
              url: `${baseUrl}/insights`
            }
          }
        ],
        [
          {
            text: "📋 Inventory",
            web_app: {
              url: `${baseUrl}/inventory`
            }
          },
          {
            text: "📈 Dashboard",
            web_app: {
              url: `${baseUrl}/dashboard`
            }
          }
        ],
        [
          {
            text: "🔔 Notifications",
            web_app: {
              url: `${baseUrl}/notifications`
            }
          },
          {
            text: "⚙️ Settings",
            web_app: {
              url: `${baseUrl}/settings`
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
            text: "💎 העלאת יהלומים",
            web_app: {
              url: `${baseUrl}/upload-single-stone`
            }
          },
          {
            text: "🏪 צפייה בחנות",
            web_app: {
              url: `${baseUrl}/store`
            }
          }
        ],
        [
          {
            text: "🤖 עוזר AI",
            web_app: {
              url: `${baseUrl}/chat`
            }
          },
          {
            text: "📊 אנליטיקס",
            web_app: {
              url: `${baseUrl}/insights`
            }
          }
        ],
        [
          {
            text: "📋 מלאי",
            web_app: {
              url: `${baseUrl}/inventory`
            }
          },
          {
            text: "📈 דשבורד",
            web_app: {
              url: `${baseUrl}/dashboard`
            }
          }
        ],
        [
          {
            text: "🔔 התראות",
            web_app: {
              url: `${baseUrl}/notifications`
            }
          },
          {
            text: "⚙️ הגדרות",
            web_app: {
              url: `${baseUrl}/settings`
            }
          }
        ]
      ]
    };
  }
}

function generateTutorialMessage(firstName: string, isEnglish: boolean = false): string {
  if (isEnglish) {
    return `🎓 <b>Quick Start Guide for ${firstName}</b>

Ready to get the most out of Diamond Muzzle? Here's your personalized tutorial:

✨ <b>In just 5 minutes, you'll learn:</b>
• How to upload your first diamond
• Setting up group monitoring alerts
• Understanding the matching system
• Maximizing your sales opportunities

🎯 <b>Best practices from successful traders:</b>
• Upload high-quality photos for better visibility
• Enable store visibility to reach more buyers
• Keep your inventory updated and accurate
• Respond quickly to match notifications

Let's start your journey to diamond trading success! 🚀`;
  } else {
    return `🎓 <b>מדריך התחלה מהירה עבור ${firstName}</b>

מוכן להפיק את המקסימום מ-Diamond Muzzle? הנה המדריך האישי שלך:

✨ <b>תוך 5 דקות בלבד תלמד:</b>
• איך להעלות את היהלום הראשון שלך
• הגדרת התראות ניטור קבוצות
• הבנת מערכת ההתאמות
• מקסימום הזדמנויות המכירה שלך

🎯 <b>שיטות עבודה מומלצות מסוחרים מצליחים:</b>
• העלאת תמונות איכותיות לנראות טובה יותר
• הפעלת נראות בחנות כדי להגיע ליותר קונים
• שמירה על מלאי מעודכן ומדויק
• מענה מהיר להתראות התאמה

בואו נתחיל את המסע שלך להצלחה במסחר ביהלומים! 🚀`;
  }
}

function createTutorialKeyboard(telegramId: number, isEnglish: boolean = false) {
  const baseUrl = Deno.env.get('WEB_APP_URL') || 'https://miniapp.mazalbot.com';
  
  if (isEnglish) {
    return {
      inline_keyboard: [
        [
          {
            text: "🎓 Start Interactive Tutorial",
            web_app: {
              url: `${baseUrl}/?tutorial=start&onboarding=true&user_id=${telegramId}`
            }
          }
        ],
        [
          {
            text: "📖 Feature Guide",
            web_app: {
              url: `${baseUrl}/tutorial`
            }
          },
          {
            text: "💬 Get Support",
            url: "https://t.me/DiamondMuzzelSupport"
          }
        ]
      ]
    };
  } else {
    return {
      inline_keyboard: [
        [
          {
            text: "🎓 התחלת מדריך אינטראקטיבי",
            web_app: {
              url: `${baseUrl}/?tutorial=start&onboarding=true&user_id=${telegramId}`
            }
          }
        ],
        [
          {
            text: "📖 מדריך תכונות",
            web_app: {
              url: `${baseUrl}/tutorial`
            }
          },
          {
            text: "💬 קבלת תמיכה",
            url: "https://t.me/DiamondMuzzelSupport"
          }
        ]
      ]
    };
  }
}
