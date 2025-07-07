import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const CLIENTS_BOT_TOKEN = Deno.env.get('CLIENTS_BOT_TOKEN');
const SELLERS_BOT_TOKEN = Deno.env.get('SELLERS_BOT_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  type: 'inventory' | 'sale' | 'system' | 'price_change' | 'low_stock';
  message: string;
  telegram_id?: number;
  group_id?: number;
  bot_type?: 'main' | 'clients' | 'sellers';
  data?: any;
}

async function sendTelegramMessage(
  botToken: string, 
  chatId: number, 
  message: string, 
  parseMode: string = 'HTML'
): Promise<boolean> {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Telegram API Error:', result);
      return false;
    }

    console.log('✅ Message sent successfully to chat:', chatId);
    return true;
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error);
    return false;
  }
}

function formatAlertMessage(type: string, message: string, data?: any): string {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let emoji = '📢';
  let title = 'Alert';

  switch (type) {
    case 'inventory':
      emoji = '💎';
      title = 'Inventory Update';
      break;
    case 'sale':
      emoji = '💰';
      title = 'Sale Notification';
      break;
    case 'price_change':
      emoji = '💹';
      title = 'Price Change';
      break;
    case 'low_stock':
      emoji = '⚠️';
      title = 'Low Stock Alert';
      break;
    case 'system':
      emoji = '🔧';
      title = 'System Alert';
      break;
  }

  let formattedMessage = `${emoji} <b>${title}</b>\n\n${message}`;

  // Add data details if provided
  if (data) {
    if (data.diamond) {
      const diamond = data.diamond;
      formattedMessage += `\n\n💎 <b>Diamond Details:</b>`;
      if (diamond.stock_number) formattedMessage += `\n📋 Stock: ${diamond.stock_number}`;
      if (diamond.shape) formattedMessage += `\n💍 Shape: ${diamond.shape}`;
      if (diamond.weight) formattedMessage += `\n⚖️ Carat: ${diamond.weight}`;
      if (diamond.color) formattedMessage += `\n🎨 Color: ${diamond.color}`;
      if (diamond.clarity) formattedMessage += `\n✨ Clarity: ${diamond.clarity}`;
      if (diamond.price_per_carat) formattedMessage += `\n💰 Price: $${diamond.price_per_carat}/ct`;
    }

    if (data.user) {
      formattedMessage += `\n\n👤 <b>User:</b> ${data.user.first_name || 'User'} (ID: ${data.user.telegram_id})`;
    }

    if (data.stats) {
      formattedMessage += `\n\n📊 <b>Statistics:</b>`;
      Object.entries(data.stats).forEach(([key, value]) => {
        formattedMessage += `\n• ${key}: ${value}`;
      });
    }
  }

  formattedMessage += `\n\n🕐 <i>${timestamp} UTC</i>`;
  
  return formattedMessage;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Telegram Alerts: Function called');

    // Check if bot tokens are configured
    if (!TELEGRAM_BOT_TOKEN && !CLIENTS_BOT_TOKEN && !SELLERS_BOT_TOKEN) {
      console.error('❌ No Telegram bot tokens configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No bot tokens configured' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const alertData: AlertRequest = await req.json();
    console.log('📨 Alert request:', alertData);

    // Validate required fields
    if (!alertData.type || !alertData.message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: type and message' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!alertData.telegram_id && !alertData.group_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Either telegram_id or group_id must be provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Select appropriate bot token
    let botToken: string;
    switch (alertData.bot_type) {
      case 'clients':
        botToken = CLIENTS_BOT_TOKEN || TELEGRAM_BOT_TOKEN || '';
        break;
      case 'sellers':
        botToken = SELLERS_BOT_TOKEN || TELEGRAM_BOT_TOKEN || '';
        break;
      default:
        botToken = TELEGRAM_BOT_TOKEN || '';
    }

    if (!botToken) {
      console.error('❌ No valid bot token available for type:', alertData.bot_type);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No valid bot token available' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format the message
    const formattedMessage = formatAlertMessage(alertData.type, alertData.message, alertData.data);

    // Send the message
    const chatId = alertData.telegram_id || alertData.group_id!;
    const success = await sendTelegramMessage(botToken, chatId, formattedMessage);

    if (success) {
      console.log('✅ Alert sent successfully');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Alert sent successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('❌ Failed to send alert');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send alert' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in telegram-alerts function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});