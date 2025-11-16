import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

interface DiamondData {
  stock_number: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  picture?: string;
  certificate_url?: string;
}

interface RequestBody {
  telegram_id: number;
  message: string;
  diamonds: DiamondData[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegram_id, message, diamonds }: RequestBody = await req.json();

    console.log('📤 Sending rich diamond message:', {
      telegram_id,
      message_length: message?.length,
      diamonds_count: diamonds?.length
    });

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const MINI_APP_URL = Deno.env.get('MINI_APP_URL') || 'https://brillianttg.lovable.app';

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    if (!telegram_id) {
      throw new Error('telegram_id is required');
    }

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
    const appUrl = Deno.env.env.get('WEBAPP_URL') || 'https://miniapp.mazalbot.com';

    // Step 1: Send the AI-generated message first
    if (message && message.trim()) {
      const messageResponse = await fetch(`${telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.text();
        console.error('Failed to send initial message:', errorData);
      } else {
        console.log('✅ Initial message sent successfully');
      }

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Step 2: Send each diamond as a rich card with image and buttons
    const sentDiamonds = [];
    const failedDiamonds = [];

    for (const diamond of diamonds) {
      try {
        // Validate and fix image URL
        let imageUrl = diamond.picture;
        
        if (imageUrl) {
          // Convert .html URLs to actual image URLs if needed
          if (imageUrl.includes('.html')) {
            imageUrl = `https://s3.eu-west-1.amazonaws.com/my360.fab/${diamond.stock_number}.jpg`;
          }
          
          // Ensure HTTPS for Telegram compatibility
          if (imageUrl.startsWith('http://')) {
            imageUrl = imageUrl.replace('http://', 'https://');
          }
          
          // Validate image URL format for Telegram
          if (!imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
            console.warn(`⚠️ Invalid image format for ${diamond.stock_number}, sending text only`);
            imageUrl = null;
          }
        }
        
        // Format diamond message with emojis and structure
        const diamondMessage = formatDiamondMessage(diamond);
        
        // Create inline keyboard with proper Telegram deep links
        const inlineKeyboard = [
          [
            {
              text: '💎 פרטים מלאים + תמונות HD',
              web_app: { url: `${appUrl}?startapp=diamond_${diamond.stock_number}` }
            }
          ],
          [
            {
              text: '🏪 כל היהלומים',
              web_app: { url: `${appUrl}?startapp=store` }
            }
          ]
        ];

        // Try to send with photo first
        if (imageUrl) {
          console.log(`📸 Attempting to send diamond ${diamond.stock_number} with image`);
          
          try {
            const photoResponse = await fetch(`${telegramApiUrl}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: telegram_id,
                photo: imageUrl,
                caption: diamondMessage,
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: inlineKeyboard
                }
              }),
            });

            const photoResult = await photoResponse.json();
            
            if (!photoResponse.ok || !photoResult.ok) {
              console.warn(`📸 Photo send failed for ${diamond.stock_number}, falling back to text:`, photoResult.description);
              
              // Fallback to text message
              await sendDiamondAsText(telegramApiUrl, telegram_id, diamondMessage, inlineKeyboard);
              sentDiamonds.push(diamond.stock_number);
            } else {
              console.log(`✅ Diamond ${diamond.stock_number} sent with photo`);
              sentDiamonds.push(diamond.stock_number);
            }
          } catch (photoError) {
            console.warn(`📸 Photo send error for ${diamond.stock_number}, falling back to text:`, photoError);
            
            // Fallback to text message
            await sendDiamondAsText(telegramApiUrl, telegram_id, diamondMessage, inlineKeyboard);
            sentDiamonds.push(diamond.stock_number);
          }
        } else {
          // No image available, send as text
          console.log(`📝 Sending diamond ${diamond.stock_number} as text (no image available)`);
          await sendDiamondAsText(telegramApiUrl, telegram_id, diamondMessage, inlineKeyboard);
          sentDiamonds.push(diamond.stock_number);
        }

        // Delay between diamond messages to avoid rate limiting
        if (diamonds.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`Error sending diamond ${diamond.stock_number}:`, error);
        failedDiamonds.push(diamond.stock_number);
      }
    }

    console.log('📊 Send summary:', {
      total: diamonds.length,
      sent: sentDiamonds.length,
      failed: failedDiamonds.length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_count: sentDiamonds.length,
        failed_count: failedDiamonds.length,
        sent_diamonds: sentDiamonds,
        failed_diamonds: failedDiamonds
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-rich-diamond-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function formatDiamondMessage(diamond: DiamondData): string {
  const shapeEmoji = getShapeEmoji(diamond.shape);
  const priceFormatted = diamond.price > 0
    ? `💰 $${diamond.price.toLocaleString()}`
    : '💰 צור קשר למחיר';

  return `✨${shapeEmoji} **${diamond.carat}ct ${diamond.shape.toUpperCase()} BRILLIANT** ${shapeEmoji}✨

🏆 **יהלום פרמיום זמין עכשיו!**
*${diamond.color} צבע • ${diamond.clarity} ניקיון • ${diamond.cut} חיתוך*

💎 **${priceFormatted}**

🔥 **למה הלקוח יבחר ביהלום הזה?**
• ✨ איכות פרמיום עם תעודת ${diamond.cut === 'EXCELLENT' ? 'מעולה' : diamond.cut}
• 📊 מדדי איכות מושלמים
• 🎯 מחיר תחרותי במיוחד
• ⚡ זמין לאספקה מיידית
• 🔒 אחריות מלאה ותעודה

📋 **מק"ט:** \`${diamond.stock_number}\`

🎯 **רוצה לראות עוד פרטים? לחץ על הכפתורים למטה! 👇**`;
}

async function sendDiamondAsText(
  telegramApiUrl: string,
  chatId: number,
  message: string,
  inlineKeyboard: any[]
): Promise<void> {
  const textResponse = await fetch(`${telegramApiUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `${message}\n\n🖼️ [תמונת היהלום זמינה במערכת]`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    }),
  });

  if (!textResponse.ok) {
    const errorData = await textResponse.text();
    throw new Error(`Failed to send text message: ${errorData}`);
  }
}

function getShapeEmoji(shape: string): string {
  const shapeMap: Record<string, string> = {
    'round': '💎',
    'princess': '👑',
    'cushion': '🔶',
    'emerald': '📗',
    'oval': '🥚',
    'pear': '💧',
    'marquise': '🌙',
    'radiant': '✨',
    'asscher': '🔷',
    'heart': '💖'
  };

  return shapeMap[shape.toLowerCase()] || '💎';
}
