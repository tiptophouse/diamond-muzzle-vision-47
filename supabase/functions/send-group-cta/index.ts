
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Enhanced Group CTA function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      groupId, 
      botUsername: providedBotUsername,
      useMultipleButtons = true,
      includePremiumButton = true,
      includeInventoryButton = true,
      includeChatButton = true
    } = await req.json();
    
    console.log('📥 Enhanced CTA request:', { 
      hasMessage: !!message, 
      groupId, 
      botUsername: providedBotUsername,
      useMultipleButtons,
      includePremiumButton,
      includeInventoryButton,
      includeChatButton
    });

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botUsername = providedBotUsername || Deno.env.get('TELEGRAM_BOT_USERNAME') || 'diamondmazalbot';
    
    // Enhanced default message
    const defaultMessage = `💎 **העלו את העסק שלכם לרמה הבאה עם BrilliantBot!**

🚀 **הבוט החכם ביותר לסוחרי יהלומים:**
• 🔍 חיפוש מתקדם במלאי
• 📊 ניתוחי שוק בזמן אמת
• 💰 מעקב רווחיות חכם
• 🎯 התאמות מושלמות ללקוחות

⭐ **אלפי סוחרים כבר משתמשים - הצטרפו עכשיו!**`;

    const finalMessage = message || defaultMessage;

    // Create dynamic inline keyboard with only web_app buttons (no mixing with other button types)
    let inlineKeyboard = [];

    if (useMultipleButtons) {
      // Main CTA button - routes to dashboard
      inlineKeyboard.push([{
        text: '🏠 התחל במחוון הראשי',
        web_app: {
          url: `https://diamondbot-store.vercel.app/?utm_source=group_cta&utm_campaign=main_dashboard&start=group_activation&button_clicked=main_dashboard`
        }
      }]);

      // Secondary action buttons row
      const secondRow = [];
      
      if (includePremiumButton) {
        secondRow.push({
          text: '💎 תכונות פרמיום',
          web_app: {
            url: `https://diamondbot-store.vercel.app/dashboard?utm_source=group_cta&utm_campaign=premium_features&start=premium_features&focus=premium&button_clicked=premium_features`
          }
        });
      }

      if (includeInventoryButton) {
        secondRow.push({
          text: '📦 ניהול מלאי',
          web_app: {
            url: `https://diamondbot-store.vercel.app/inventory?utm_source=group_cta&utm_campaign=inventory_demo&start=inventory_demo&button_clicked=inventory_management`
          }
        });
      }

      // Add second row if it has buttons
      if (secondRow.length > 0) {
        inlineKeyboard.push(secondRow);
      }

      // Third row for AI chat button
      if (includeChatButton) {
        inlineKeyboard.push([{
          text: '🤖 צ\'אט AI יועץ יהלומים',
          web_app: {
            url: `https://diamondbot-store.vercel.app/chat?utm_source=group_cta&utm_campaign=ai_chat_demo&start=ai_chat_demo&welcome=true&button_clicked=ai_chat`
          }
        }]);
      }

      // Store button - direct to marketplace
      inlineKeyboard.push([{
        text: '🏪 חנות יהלומים מקוונת',
        web_app: {
          url: `https://diamondbot-store.vercel.app/store?utm_source=group_cta&utm_campaign=store_visit&start=store_demo&view=featured&button_clicked=online_store`
        }
      }]);

    } else {
      // Single button fallback - routes to dashboard
      inlineKeyboard = [[
        {
          text: '🚀 התחל עם BrilliantBot',
          web_app: {
            url: `https://diamondbot-store.vercel.app/?utm_source=group_cta&utm_campaign=single_button&start=group_activation&button_clicked=single_start`
          }
        }
      ]];
    }

    console.log('📤 Sending enhanced CTA message with intelligent routing and', inlineKeyboard.length, 'button rows');
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: groupId || -1001009290613,
        text: finalMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      }),
    });

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response:', result);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send enhanced group CTA message', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Enhanced Group CTA message with intelligent routing sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        groupId: groupId || -1001009290613,
        buttonsCount: inlineKeyboard.length,
        intelligentRouting: true,
        features: {
          useMultipleButtons,
          includePremiumButton,
          includeInventoryButton,
          includeChatButton
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending enhanced group CTA message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
