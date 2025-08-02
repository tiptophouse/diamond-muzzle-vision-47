
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkUploadNotificationData {
  userId: number;
  userName: string;
  diamondCount: number;
  uploadType: 'csv' | 'manual';
  timestamp: string;
}

serve(async (req) => {
  console.log('🚀 Bulk upload notification function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, diamondCount, uploadType, timestamp }: BulkUploadNotificationData = await req.json();
    console.log('📥 Notification data:', { userId, userName, diamondCount, uploadType });
    
    // Only send notification if diamond count is greater than 80
    if (diamondCount <= 80) {
      console.log('📊 Diamond count below threshold, no notification sent');
      return new Response(
        JSON.stringify({ message: 'Diamond count below notification threshold' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const groupId = Deno.env.get('B2B_GROUP_ID');
    
    if (!botToken || !groupId) {
      console.error('❌ Missing bot token or group ID');
      return new Response(
        JSON.stringify({ error: 'Bot configuration not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification message
    const message = `🎉 *BULK UPLOAD ALERT!*

💎 **${userName}** just uploaded **${diamondCount} diamonds**!

📊 Upload Details:
• Method: ${uploadType === 'csv' ? '📄 CSV Upload' : '✍️ Manual Entry'}
• Count: ${diamondCount} diamonds
• Time: ${new Date(timestamp).toLocaleString()}
• User ID: ${userId}

This is a significant inventory addition! 🚀

#BulkUpload #DiamondTrading #InventoryUpdate`;

    console.log('📤 Sending notification to Telegram group...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: groupId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
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

    console.log('✅ Bulk upload notification sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        diamondCount,
        notificationSent: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending bulk upload notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
