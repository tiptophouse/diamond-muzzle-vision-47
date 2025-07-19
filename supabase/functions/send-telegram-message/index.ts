
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoneData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut?: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  pricePerCarat?: number;
  lab?: string;
  certificateNumber?: string;
}

interface UploadReminderData {
  firstName: string;
  uploadUrl: string;
}

function generateStoneSummary(stone: StoneData): string {
  const priceInfo = stone.pricePerCarat ? `\n💰 Price: $${stone.pricePerCarat}/ct` : '';
  const cutInfo = stone.cut ? `\n✂️ Cut: ${stone.cut}` : '';
  const certInfo = stone.certificateNumber ? `\n📋 Cert: ${stone.certificateNumber}` : '';
  const labInfo = stone.lab ? ` (${stone.lab})` : '';
  
  return `💎 **Stone Uploaded Successfully!**

📊 **Details:**
🔸 Stock: ${stone.stockNumber}
🔹 Shape: ${stone.shape}
⚖️ Weight: ${stone.carat}ct
🎨 Color: ${stone.color}
💎 Clarity: ${stone.clarity}${cutInfo}
✨ Polish: ${stone.polish}
🔄 Symmetry: ${stone.symmetry}
🌟 Fluorescence: ${stone.fluorescence}${priceInfo}${certInfo}${labInfo}`;
}

function generateUploadReminderMessage(data: UploadReminderData): string {
  return `🔍 **Upload Your Diamond Certificate!**

שלום ${data.firstName}! 👋

📋 **Ready to add your diamonds to the system?**

✨ **Quick Certificate Scan:**
• Simply photograph your GIA certificate
• Our AI will extract all diamond details automatically
• Your inventory will be ready in seconds!

💎 **Why upload now?**
• Get discovered by potential buyers
• Professional diamond showcase
• Secure certificate storage
• Real-time market exposure

🚀 **Start uploading:** [Upload Certificate](${data.uploadUrl})

Need help? Reply to this message and we'll guide you through the process.

**Happy Diamond Trading!** 💎`;
}

serve(async (req) => {
  console.log('🚀 Telegram message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramId, messageType, stoneData, uploadReminderData, storeUrl } = await req.json();
    console.log('📥 Request data:', { telegramId, messageType, hasStoneData: !!stoneData, hasUploadData: !!uploadReminderData });
    
    if (!telegramId) {
      console.error('❌ Missing required telegramId');
      return new Response(
        JSON.stringify({ error: 'Missing required telegramId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let message = '';
    
    // Generate message based on type
    if (messageType === 'upload_reminder' && uploadReminderData) {
      message = generateUploadReminderMessage(uploadReminderData);
    } else if (messageType === 'stone_upload' && stoneData) {
      const summary = generateStoneSummary(stoneData);
      const storeLink = storeUrl ? `\n\n🔗 [View in Store](${storeUrl})` : '';
      message = `${summary}${storeLink}`;
    } else {
      console.error('❌ Invalid message type or missing data');
      return new Response(
        JSON.stringify({ error: 'Invalid message type or missing required data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📤 Sending message to Telegram...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      }),
    });

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response:', result);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram message', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message sent successfully');
    return new Response(
      JSON.stringify({ success: true, messageId: result.result.message_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending Telegram message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
