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

interface EnhancedMessageRequest {
  telegramId: number;
  message: string;
  buttons?: MessageButton[];
  imageUrl?: string;
  parseMode?: 'HTML' | 'Markdown';
  disablePreview?: boolean;
}

serve(async (req) => {
  console.log('🚀 Enhanced individual message function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      telegramId, 
      message, 
      buttons, 
      imageUrl,
      parseMode = 'Markdown',
      disablePreview = false
    }: EnhancedMessageRequest = await req.json();
    
    console.log('📥 Request data:', { 
      telegramId, 
      hasMessage: !!message, 
      buttonsCount: buttons?.length || 0,
      hasImage: !!imageUrl,
      parseMode
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

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

    // Prepare inline keyboard if buttons are provided
    const inlineKeyboard = buttons && buttons.length > 0 ? {
      reply_markup: {
        inline_keyboard: buttons.map(button => [{
          text: button.text,
          url: button.url
        }])
      }
    } : {};

    let response;
    let result;

    // Try sending with image first if imageUrl is provided
    if (imageUrl) {
      console.log('📸 Attempting to send with image:', imageUrl.substring(0, 50) + '...');
      
      // Validate and fix image URL format
      let processedImageUrl = imageUrl;
      
      // Convert .html URLs to actual image URLs if needed
      if (imageUrl.includes('.html')) {
        console.log('🔄 Converting HTML URL to image URL');
        processedImageUrl = imageUrl.replace('.html', '.jpg');
      }
      
      // Ensure HTTPS for Telegram compatibility
      if (processedImageUrl.startsWith('http://')) {
        processedImageUrl = processedImageUrl.replace('http://', 'https://');
      }

      try {
        response = await fetch(`${telegramApiUrl}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramId,
            photo: processedImageUrl,
            caption: message,
            parse_mode: parseMode,
            ...inlineKeyboard
          })
        });

        result = await response.json();
        
        if (!response.ok || !result.ok) {
          console.warn('📸 Photo send failed, falling back to text:', result.description);
          throw new Error('Photo send failed');
        }

        console.log('✅ Photo message sent successfully');
      } catch (photoError) {
        console.warn('📸 Photo send error, falling back to text:', photoError);
        
        // Fallback to text message with image link
        const messageWithImageLink = `${message}\n\n🖼️ [צפה בתמונת היהלום](${processedImageUrl})`;
        
        response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramId,
            text: messageWithImageLink,
            parse_mode: parseMode,
            disable_web_page_preview: disablePreview,
            ...inlineKeyboard
          })
        });

        result = await response.json();
      }
    } else {
      // Send text message only
      console.log('📝 Sending text message only');
      
      response = await fetch(`${telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: parseMode,
          disable_web_page_preview: disablePreview,
          ...inlineKeyboard
        })
      });

      result = await response.json();
    }

    console.log('📨 Telegram API response status:', response.status);
    
    if (!response.ok || !result.ok) {
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
        } else if (result.description.includes('photo')) {
          errorMessage = 'Image format not supported';
        } else {
          errorMessage = result.description;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          telegram_error: result,
          user_id: telegramId 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Enhanced message sent successfully to user:', telegramId);
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        userId: telegramId,
        type: imageUrl ? 'photo' : 'text'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending enhanced individual message:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});