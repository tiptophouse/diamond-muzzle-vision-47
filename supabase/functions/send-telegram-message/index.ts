
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TelegramRequest {
  telegramId: number;
  message?: string;
  stoneData?: any;
  storeUrl?: string;
  directMessage?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Telegram message function invoked');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TelegramRequest = await req.json();
    console.log('📥 Request data:', {
      telegramId: body.telegramId,
      hasMessage: !!body.message,
      hasStoneData: !!body.stoneData,
      hasStoreUrl: !!body.storeUrl,
      directMessage: body.directMessage
    });

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    let messageText: string;

    // Handle direct messages (like OTP) without stone data wrapper
    if (body.directMessage && body.message) {
      messageText = body.message;
    } else if (body.storeUrl && !body.stoneData) {
      // Store sharing message
      messageText = body.storeUrl;
    } else if (body.stoneData && typeof body.stoneData === 'object') {
      // Stone upload notification
      const stone = body.stoneData;
      messageText = `💎 Stone Uploaded Successfully!

📊 Details:
🔸 Stock: ${stone.stockNumber || 'N/A'}
🔹 Shape: ${stone.shape || 'N/A'}
⚖️ Weight: ${stone.carat || 0}ct
🎨 Color: ${stone.color || 'N/A'}
💎 Clarity: ${stone.clarity || 'N/A'}
✨ Polish: ${stone.polish || 'N/A'}
🔄 Symmetry: ${stone.symmetry || 'N/A'}
🌟 Fluorescence: ${stone.fluorescence || 'N/A'}
📋 Cert: ${stone.certificateNumber || 'N/A'}

${body.storeUrl || '🔗 View in Store'}`;
    } else {
      // Fallback message
      messageText = body.message || body.storeUrl || "New notification from BrilliantBot";
    }

    console.log('📤 Sending message to Telegram...');
    
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: body.telegramId,
        text: messageText,
        parse_mode: 'Markdown'
      }),
    });

    const responseData = await telegramResponse.json();
    console.log('📨 Telegram API response:', responseData);

    if (!telegramResponse.ok) {
      throw new Error(`Telegram API error: ${responseData.description || 'Unknown error'}`);
    }

    console.log('✅ Message sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: responseData.result?.message_id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('❌ Error in send-telegram-message function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
