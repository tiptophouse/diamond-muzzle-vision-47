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
        // Format diamond message with emojis and structure
        const diamondMessage = formatDiamondMessage(diamond);
        
        // Create inline keyboard buttons
        const inlineKeyboard = [
          [
            {
              text: '💎 פרטים מלאים',
              web_app: { url: `${MINI_APP_URL}/diamond/${diamond.stock_number}` }
            }
          ],
          [
            {
              text: '🏪 כל היהלומים',
              web_app: { url: `${MINI_APP_URL}/store` }
            }
          ]
        ];

        // Try to send with photo first
        if (diamond.picture) {
          const photoResponse = await fetch(`${telegramApiUrl}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegram_id,
              photo: diamond.picture,
              caption: diamondMessage,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: inlineKeyboard
              }
            }),
          });

          if (!photoResponse.ok) {
            const errorData = await photoResponse.text();
            console.error(`Failed to send photo for diamond ${diamond.stock_number}:`, errorData);
            
            // Fallback: Send as text message
            await sendDiamondAsText(telegramApiUrl, telegram_id, diamondMessage, inlineKeyboard);
          } else {
            console.log(`✅ Diamond ${diamond.stock_number} sent with photo`);
            sentDiamonds.push(diamond.stock_number);
          }
        } else {
          // No image available, send as text
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
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(diamond.price);

  return `✨${shapeEmoji} ${diamond.shape.toUpperCase()} ${diamond.carat}ct BRILLIANT ✨

🏆 *Premium Diamond Available Now!*

💎 *Specifications:*
• Shape: ${diamond.shape}
• Weight: ${diamond.carat} Carat
• Color: ${diamond.color}
• Clarity: ${diamond.clarity}
• Cut: ${diamond.cut}

💰 *Price:* ${priceFormatted}

📋 *Stock #:* \`${diamond.stock_number}\`

👇 *Click buttons below for more details!*`;
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
      text: message,
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
