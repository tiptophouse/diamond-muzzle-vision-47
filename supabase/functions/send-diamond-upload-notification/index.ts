
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiamondUploadNotificationData {
  userId: number;
  userName: string;
  diamondCount: number;
  uploadType: 'single' | 'bulk';
  timestamp: string;
  groupId?: string;
}

serve(async (req) => {
  console.log('🚀 Diamond upload notification function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, diamondCount, uploadType, timestamp, groupId }: DiamondUploadNotificationData = await req.json();
    console.log('📥 Notification data:', { userId, userName, diamondCount, uploadType });

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const targetGroupId = groupId || Deno.env.get('B2B_GROUP_ID');
    
    if (!botToken || !targetGroupId) {
      console.error('❌ Missing bot token or group ID');
      return new Response(
        JSON.stringify({ error: 'Bot configuration not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure store URL with authentication requirement
    const secureStoreUrl = `https://miniapp.mazalbot.com/store?dealer=${userId}&auth=required&ref=group_share`;
    
    // Create the notification message
    const diamondText = diamondCount === 1 ? 'diamond' : 'diamonds';
    const message = `💎 **NEW DIAMOND ARRIVAL!**

🔸 **${userName}** just uploaded **${diamondCount} ${diamondText}**!

📊 **Upload Details:**
• Method: ${uploadType === 'single' ? '✍️ Single Upload' : '📄 Bulk Upload'}
• Count: ${diamondCount} ${diamondText}
• Time: ${new Date(timestamp).toLocaleString()}

🏪 **Want to see ${userName}'s store?**
Click the button below to view their complete inventory securely:

#DiamondUpload #NewInventory #DiamondTrading`;

    // Create inline keyboard with secure store share button
    const inline_keyboard = [
      [
        {
          text: `🏪 View ${userName}'s Secure Store`,
          web_app: {
            url: secureStoreUrl
          }
        }
      ],
      [
        {
          text: '💬 Contact Dealer',
          callback_data: `contact_dealer_${userId}`
        },
        {
          text: '📊 View Details',
          callback_data: `view_details_${userId}_${Date.now()}`
        }
      ]
    ];

    console.log('📤 Sending notification to Telegram group...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetGroupId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard
        }
      }),
    });

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response:', result);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram notification', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Diamond upload notification sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        diamondCount,
        notificationSent: true,
        secureStoreUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending diamond upload notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
