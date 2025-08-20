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

serve(async (req) => {
  console.log('🚀 Telegram message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramId, stoneData, storeUrl } = await req.json();
    console.log('📥 Request data:', { telegramId, stoneData: !!stoneData, storeUrl });
    
    if (!telegramId || !stoneData) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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

    const summary = generateStoneSummary(stoneData);
    const storeLink = storeUrl ? `\n\n🔗 [View in Store](${storeUrl})` : '';
    const message = `${summary}${storeLink}`;

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