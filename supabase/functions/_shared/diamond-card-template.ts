/**
 * Reusable Diamond Card Template Utility
 * Used across auctions, notifications, group shares, and other features
 */

export interface DiamondCardData {
  id?: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  price_per_carat?: number;
  picture?: string;
  gem360_url?: string;
}

export interface DiamondCardOptions {
  customMessage?: string;
  sharedByName?: string;
  sharedById?: number;
  context?: 'group_share' | 'auction' | 'notification' | 'offer';
  includePrice?: boolean;
  additionalButtons?: Array<{ text: string; url?: string; callback_data?: string }>;
  includeStoreButton?: boolean; // Default true
  botUsername?: string;
  baseUrl?: string;
}

/**
 * Get emoji for diamond shape
 */
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

/**
 * Format price display
 */
function formatPrice(pricePerCarat?: number, weight?: number): string {
  if (!pricePerCarat || pricePerCarat <= 0) {
    return '💰 צור קשר למחיר';
  }
  
  const totalPrice = weight ? pricePerCarat * weight : pricePerCarat;
  return `💰 $${totalPrice.toLocaleString()}`;
}

/**
 * Create diamond card message text
 */
export function createDiamondCardMessage(
  diamond: DiamondCardData,
  options: DiamondCardOptions = {}
): string {
  const {
    customMessage,
    sharedByName,
    context = 'group_share',
    includePrice = true,
  } = options;

  const shapeEmoji = getShapeEmoji(diamond.shape);
  const priceText = includePrice ? formatPrice(diamond.price_per_carat, diamond.weight) : '';

  // Context-specific headers
  const headers: Record<string, string> = {
    'group_share': '✨💎 **יהלום פרמיום זמין!** 💎✨',
    'auction': '🔨 **מכרז פעיל - יהלום יוקרתי** 🔨',
    'notification': '🔔 **עדכון יהלום חדש** 🔔',
    'offer': '💎 **הצעה מיוחדת ליהלום** 💎',
  };

  const header = headers[context] || headers['group_share'];

  let message = `${shapeEmoji} **${diamond.weight}ct ${diamond.shape.toUpperCase()} BRILLIANT** ${shapeEmoji}

${header}
*${diamond.color} צבע • ${diamond.clarity} ניקיון • ${diamond.cut} חיתוך*

${priceText}

📋 **מק"ט:** \`${diamond.stock_number}\``;

  if (sharedByName) {
    message += `\n👤 **מוצע על ידי:** ${sharedByName}`;
  }

  if (customMessage) {
    message += `\n\n📝 **הודעה:** ${customMessage}`;
  }

  message += `\n\n🎯 **רוצה לראות עוד פרטים? השתמש בכפתורים למטה! 👇**`;

  return message;
}

/**
 * Create inline keyboard buttons for diamond card
 */
export function createDiamondInlineButtons(
  diamond: DiamondCardData,
  options: DiamondCardOptions = {}
): Array<Array<{ text: string; url?: string; callback_data?: string }>> {
  const {
    sharedById,
    additionalButtons = [],
    includeStoreButton = true, // Default to true
    botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'BrilliantBot_bot',
    baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://uhhljqgxhdhbbhpohxll.supabase.co',
  } = options;

  const telegramBotUrl = `https://t.me/${botUsername}`;

  const buttons: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];

  // Main action buttons (first row)
  const mainButtons: Array<{ text: string; url?: string; callback_data?: string }> = [];

  if (diamond.id) {
    mainButtons.push({
      text: '💎 פרטים מלאים',
      url: `${baseUrl}/diamond/${diamond.id}?shared=true${sharedById ? `&from=${sharedById}` : ''}&verify=true`
    });
  } else {
    mainButtons.push({
      text: '💎 פרטים מלאים',
      url: `${telegramBotUrl}?startapp=diamond_${diamond.stock_number}`
    });
  }

  buttons.push(mainButtons);

  // Additional buttons (e.g., auction bid, contact seller)
  if (additionalButtons.length > 0) {
    // Group additional buttons in rows of 2
    for (let i = 0; i < additionalButtons.length; i += 2) {
      buttons.push(additionalButtons.slice(i, i + 2));
    }
  }

  // Store button (last row) - conditional
  if (includeStoreButton) {
    buttons.push([
      {
        text: '🏪 כל היהלומים',
        url: `${telegramBotUrl}?startapp=store`
      }
    ]);
  }

  return buttons;
}

/**
 * Create complete diamond card (message + buttons)
 */
export function createDiamondCard(
  diamond: DiamondCardData,
  options: DiamondCardOptions = {}
): {
  message: string;
  inline_keyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  parse_mode: string;
} {
  return {
    message: createDiamondCardMessage(diamond, options),
    inline_keyboard: createDiamondInlineButtons(diamond, options),
    parse_mode: 'Markdown',
  };
}

/**
 * Send diamond card to Telegram chat
 */
export async function sendDiamondCard(
  chatId: number,
  diamond: DiamondCardData,
  options: DiamondCardOptions = {}
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  if (!telegramBotToken) {
    return { success: false, error: 'Telegram bot token not configured' };
  }

  const card = createDiamondCard(diamond, options);
  const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}`;

  try {
    // Try sending with photo first if available
    if (diamond.picture) {
      let imageUrl = diamond.picture;
      
      // Convert .html URLs to actual image URLs
      if (imageUrl.includes('.html')) {
        imageUrl = `https://s3.eu-west-1.amazonaws.com/my360.fab/${diamond.stock_number}.jpg`;
      }
      
      // Ensure HTTPS
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }

      // Send photo with caption
      const photoResponse = await fetch(`${telegramApiUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: card.message,
          parse_mode: card.parse_mode,
          reply_markup: {
            inline_keyboard: card.inline_keyboard
          }
        }),
      });

      const photoResult = await photoResponse.json();
      
      if (photoResult.ok) {
        return { success: true, messageId: photoResult.result.message_id };
      }
    }

    // Fallback to text message
    const textResponse = await fetch(`${telegramApiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: card.message,
        parse_mode: card.parse_mode,
        reply_markup: {
          inline_keyboard: card.inline_keyboard
        }
      }),
    });

    const textResult = await textResponse.json();
    
    if (textResult.ok) {
      return { success: true, messageId: textResult.result.message_id };
    }

    return { success: false, error: textResult.description };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Edit existing diamond card message
 */
export async function editDiamondCard(
  chatId: number,
  messageId: number,
  diamond: DiamondCardData,
  options: DiamondCardOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  
  if (!telegramBotToken) {
    return { success: false, error: 'Telegram bot token not configured' };
  }

  const card = createDiamondCard(diamond, options);
  const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}`;

  try {
    // Edit message caption (for photo messages) or text
    const editResponse = await fetch(`${telegramApiUrl}/editMessageCaption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        caption: card.message,
        parse_mode: card.parse_mode,
        reply_markup: {
          inline_keyboard: card.inline_keyboard
        }
      }),
    });

    const result = await editResponse.json();
    
    if (!result.ok) {
      // Try editing as text message if caption edit fails
      const textEditResponse = await fetch(`${telegramApiUrl}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: card.message,
          parse_mode: card.parse_mode,
          reply_markup: {
            inline_keyboard: card.inline_keyboard
          }
        }),
      });

      const textResult = await textEditResponse.json();
      return { success: textResult.ok, error: textResult.description };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
