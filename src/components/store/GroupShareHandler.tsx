// Handler functions for group diamond sharing functionality
// This component contains utility functions used by the Telegram webhook

export interface GroupShareData {
  action: string;
  data: {
    diamond: {
      id: string;
      stockNumber: string;
      carat: number;
      shape: string;
      color: string;
      clarity: string;
      cut: string;
      price: number;
      imageUrl?: string;
      gem360Url?: string;
    };
    message: string;
    inline_keyboard: Array<Array<{
      text: string;
      web_app?: { url: string };
      callback_data?: string;
    }>>;
  };
  timestamp: number;
  requiresRegistration: boolean;
}

export async function handleGroupDiamondShare(
  groupShareData: GroupShareData, 
  botToken: string,
  groupId: string
) {
  try {
    const { diamond, message, inline_keyboard } = groupShareData.data;
    
    // Send diamond card to group with inline buttons
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline_keyboard
        }
      })
    });

    if (!telegramResponse.ok) {
      throw new Error(`Telegram API error: ${telegramResponse.statusText}`);
    }

    const result = await telegramResponse.json();
    console.log('✅ Diamond shared to group successfully:', result.message_id);
    
    return { success: true, messageId: result.message_id };
  } catch (error) {
    console.error('❌ Error sharing diamond to group:', error);
    return { success: false, error: error.message };
  }
}