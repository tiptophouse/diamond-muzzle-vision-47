import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessageButton {
  text: string;
  url: string;
}

interface DiamondData {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat?: number;
  total_price?: number;
  imageUrl?: string;
  lab?: string;
  certificate_number?: string;
}

interface SendMessageRequest {
  telegramId: number;
  message: string;
  buttons?: MessageButton[];
  diamondData?: DiamondData;
}

// Helper function to format diamond caption in Hebrew
function formatDiamondCaption(diamond: DiamondData, customMessage: string): string {
  const parts: string[] = [];
  
  // Custom message first
  if (customMessage) {
    parts.push(customMessage);
    parts.push(''); // Empty line
  }
  
  // Diamond header
  parts.push('💎 <b>פרטי היהלום</b>');
  parts.push('━━━━━━━━━━━━━━━');
  parts.push('');
  
  // Stock number
  if (diamond.stock_number) {
    parts.push(`📦 <b>מק״ט:</b> ${diamond.stock_number}`);
  }
  
  // Shape and weight
  if (diamond.shape || diamond.weight) {
    const shapeWeight = [];
    if (diamond.shape) shapeWeight.push(`צורה: ${diamond.shape}`);
    if (diamond.weight) shapeWeight.push(`${diamond.weight} קראט`);
    parts.push(`💠 <b>${shapeWeight.join(' • ')}</b>`);
  }
  
  // Color and clarity
  if (diamond.color || diamond.clarity) {
    const colorClarity = [];
    if (diamond.color) colorClarity.push(`צבע: ${diamond.color}`);
    if (diamond.clarity) colorClarity.push(`זכות: ${diamond.clarity}`);
    parts.push(`✨ <b>${colorClarity.join(' • ')}</b>`);
  }
  
  // Cut quality
  if (diamond.cut) {
    parts.push(`💎 <b>ליטוש:</b> ${diamond.cut}`);
  }
  
  // Lab and certificate
  if (diamond.lab || diamond.certificate_number) {
    const labInfo = [];
    if (diamond.lab) labInfo.push(diamond.lab);
    if (diamond.certificate_number) labInfo.push(`#${diamond.certificate_number}`);
    parts.push(`📜 <b>אישור:</b> ${labInfo.join(' ')}`);
  }
  
  parts.push('');
  
  // Pricing
  if (diamond.price_per_carat || diamond.total_price) {
    parts.push('💰 <b>מחיר:</b>');
    if (diamond.price_per_carat) {
      parts.push(`   • מחיר לקראט: $${diamond.price_per_carat.toLocaleString()}`);
    }
    if (diamond.total_price) {
      parts.push(`   • מחיר כולל: $${diamond.total_price.toLocaleString()}`);
    }
  }
  
  parts.push('');
  parts.push('━━━━━━━━━━━━━━━');
  parts.push('<i>Provided by BrilliantBot</i>');
  
  return parts.join('\n');
}

serve(async (req) => {
  console.log('🚀 Individual message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramId, message, buttons, diamondData }: SendMessageRequest = await req.json();
    
    console.log('📥 Request data:', { 
      telegramId, 
      hasMessage: !!message, 
      buttonsCount: buttons?.length || 0 
    });

    if (!telegramId || !message) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing telegramId or message' }),
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

    // If diamond data with image is provided, send as photo with rich caption
    let telegramResponse;
    
    if (diamondData && diamondData.imageUrl) {
      console.log('💎 Sending diamond card with image:', diamondData.stock_number);
      
      // Format diamond details in Hebrew
      const diamondCaption = formatDiamondCaption(diamondData, message);
      
      const photoPayload: any = {
        chat_id: telegramId,
        photo: diamondData.imageUrl,
        caption: diamondCaption,
        parse_mode: 'HTML'
      };

      // Add inline keyboard if buttons are provided
      if (buttons && buttons.length > 0) {
        const keyboard = buttons.map(button => [{
          text: button.text,
          url: button.url
        }]);

        photoPayload.reply_markup = {
          inline_keyboard: keyboard
        };
      }

      console.log('📤 Sending photo message to Telegram API...');
      telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoPayload),
      });
    } else {
      // Send as regular text message
      const messageWithSignature = `${message}\n\n<i>Provided by BrilliantBot</i>`;
      
      const messagePayload: any = {
        chat_id: telegramId,
        text: messageWithSignature,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      };

      // Add inline keyboard if buttons are provided
      if (buttons && buttons.length > 0) {
        const keyboard = buttons.map(button => [{
          text: button.text,
          url: button.url
        }]);

        messagePayload.reply_markup = {
          inline_keyboard: keyboard
        };
      }

      console.log('📤 Sending text message to Telegram API...');
      telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });
    }

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response status:', telegramResponse.status);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      
      // Handle specific Telegram errors
      let errorMessage = 'Failed to send message';
      if (result.description) {
        if (result.description.includes('bot was blocked')) {
          errorMessage = 'User blocked the bot';
        } else if (result.description.includes('chat not found')) {
          errorMessage = 'User not found';
        } else if (result.description.includes('Too Many Requests')) {
          errorMessage = 'Rate limit exceeded';
        } else {
          errorMessage = result.description;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          telegram_error: result
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Message sent successfully to user:', telegramId);
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending individual message:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
