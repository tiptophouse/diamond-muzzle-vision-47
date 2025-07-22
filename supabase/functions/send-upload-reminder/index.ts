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
  users: User[];
  includeAdmin?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { users, includeAdmin = false }: RequestBody = await req.json();
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    console.log(`📤 Sending upload reminders to ${users.length} users (includeAdmin: ${includeAdmin})`);

    const results = await Promise.allSettled(
      users.map(async (user) => {
        // Determine language - default to Hebrew unless specifically English
        const isEnglish = user.language_code?.startsWith('en') || false;
        
        // Generate message in the appropriate language
        const message = generateUploadReminderMessage(user.first_name, isEnglish);
        
        // Create deep link button for Telegram mini app with appropriate language
        const keyboard = {
          inline_keyboard: [[
            {
              text: isEnglish ? "📤 Upload Your Diamonds" : "📤 העלאת יהלומים",
              web_app: {
                url: "https://miniapp.mazalbot.com/upload-single-stone"
              }
            }
          ]]
        };

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
            reply_markup: keyboard
          })
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to send to ${user.telegram_id}: ${errorData}`);
        }

        console.log(`✅ Message sent to ${user.first_name} (${user.telegram_id})`);
        return { success: true, user: user.telegram_id };
      })
    );

    // If includeAdmin, also send to admin
    if (includeAdmin) {
      try {
        // Get admin telegram ID from app settings or use fallback
        const adminId = 2138564172; // You can configure this in app_settings table
        
        const adminMessage = generateAdminPreviewMessage(users.length);
        const adminKeyboard = {
          inline_keyboard: [[
            {
              text: "📤 Upload Your Diamonds",
              web_app: {
                url: "https://miniapp.mazalbot.com/upload-single-stone"
              }
            }
          ]]
        };

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: adminId,
            text: adminMessage,
            parse_mode: 'HTML',
            reply_markup: adminKeyboard
          })
        });

        console.log(`✅ Admin preview message sent to ${adminId}`);
      } catch (adminError) {
        console.error('❌ Failed to send admin preview:', adminError);
      }
    }

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`📊 Upload reminder results: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      results: {
        successful,
        failed,
        total: users.length
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Error in send-upload-reminder:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send upload reminders',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function generateUploadReminderMessage(firstName: string, isEnglish: boolean = false): string {
  if (isEnglish) {
    return `👋 Hi ${firstName}!

🔹 We noticed you haven't uploaded your diamond inventory yet. 

💎 <b>Ready to get started?</b>
• Upload your first diamonds in just 2 minutes
• Showcase your inventory to potential buyers
• Connect with the diamond trading community

⚡ Tap the button below to upload now and start growing your business!`;
  } else {
    // Hebrew version
    return `👋 שלום ${firstName}!

🔹 שמנו לב שעדיין לא העלית את מלאי היהלומים שלך. 

💎 <b>מוכן/ה להתחיל?</b>
• העלאת היהלומים הראשונים שלך בתוך 2 דקות בלבד
• הצגת המלאי שלך לקונים פוטנציאלים
• התחברות לקהילת סוחרי היהלומים

⚡ לחץ/י על הכפתור למטה כדי להעלות עכשיו ולהתחיל לפתח את העסק שלך!`;
  }
}

function generateAdminPreviewMessage(userCount: number): string {
  return `📋 <b>Admin Preview - Upload Reminder Sent</b>

This is the message that was just sent to ${userCount} users who haven't uploaded inventory yet.
Messages are sent in Hebrew by default unless the user's language code is English.

<b>English Version:</b>
👋 Hi [User Name]!

🔹 We noticed you haven't uploaded your diamond inventory yet. 

💎 <b>Ready to get started?</b>
• Upload your first diamonds in just 2 minutes
• Showcase your inventory to potential buyers
• Connect with the diamond trading community

⚡ Tap the button below to upload now and start growing your business!

<b>Hebrew Version:</b>
👋 שלום [User Name]!

🔹 שמנו לב שעדיין לא העלית את מלאי היהלומים שלך. 

💎 <b>מוכן/ה להתחיל?</b>
• העלאת היהלומים הראשונים שלך בתוך 2 דקות בלבד
• הצגת המלאי שלך לקונים פוטנציאלים
• התחברות לקהילת סוחרי היהלומים

⚡ לחץ/י על הכפתור למטה כדי להעלות עכשיו ולהתחיל לפתח את העסק שלך!

<i>✅ Notification campaign completed successfully</i>`;
}