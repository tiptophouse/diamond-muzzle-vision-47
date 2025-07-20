import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    // Send only to admin for testing
    const adminId = 2138564172;
    const adminName = "Admin";

    console.log(`📤 Sending test upload reminder to admin (${adminId})`);

    const message = generateUploadReminderMessage(adminName);
    const keyboard = {
      inline_keyboard: [[
        {
          text: "📤 Upload Your Diamonds",
          url: "https://t.me/MazalBotBot/app?startapp=upload-single-stone"
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
        chat_id: adminId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send test message: ${errorData}`);
    }

    console.log(`✅ Test message sent successfully to admin (${adminId})`);

    return new Response(JSON.stringify({
      success: true,
      message: "Test upload reminder sent to admin successfully",
      admin_id: adminId
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Error in test-upload-reminder:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send test upload reminder',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function generateUploadReminderMessage(firstName: string): string {
  return `👋 Hi ${firstName}!

🔹 We noticed you haven't uploaded your diamond inventory yet. 

💎 <b>Ready to get started?</b>
• Upload your first diamonds in just 2 minutes
• Showcase your inventory to potential buyers
• Connect with the diamond trading community

⚡ Tap the button below to upload now and start growing your business!

<i>🧪 This is a test notification - the deep link should take you to the upload page</i>`;
}