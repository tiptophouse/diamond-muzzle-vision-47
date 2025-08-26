
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
    
    // Enhanced Hebrew message
    const defaultMessage = `💎 *פתח עסק יהלומים מצליח עם BrilliantBot*

🚀 *הפלטפורמה המתקדמת לסוחרי יהלומים:*
• 📱 ניהול מלאי חכם ומתקדם
• 🔍 חיפוש מהיר ויעיל ביהלומים
• 💰 מעקב רווחיות ומחירים
• 🎯 התאמה מושלמת ללקוחות
• 📊 דוחות מכירות מפורטים

⭐ *אלפי סוחרים כבר מרוויחים איתנו - הצטרף עכשיו!*

🎁 *התחל חינם והעלה את העסק שלך לרמה הבאה*`;

    const finalMessage = message || defaultMessage;

    // Create beautiful inline keyboard with functional routing
    let inlineKeyboard = [];

    if (useMultipleButtons) {
      // Main CTA button - routes to main dashboard
      inlineKeyboard.push([{
        text: '🏠 התחל עכשיו - מחוון ראשי',
        web_app: {
          url: `https://diamondbot-store.vercel.app/?utm_source=group_cta&utm_campaign=main_dashboard&start=group_activation&button_clicked=main_dashboard&from=telegram_group`
        }
      }]);

      // Second row - Inventory and Store
      const secondRow = [];
      
      if (includeInventoryButton) {
        secondRow.push({
          text: '📦 ניהול מלאי יהלומים',
          web_app: {
            url: `https://diamondbot-store.vercel.app/inventory?utm_source=group_cta&utm_campaign=inventory_demo&start=inventory_demo&button_clicked=inventory_management&from=telegram_group`
          }
        });
      }

      if (includePremiumButton) {
        secondRow.push({
          text: '💎 חנות יהלומים מקוונת',
          web_app: {
            url: `https://diamondbot-store.vercel.app/store?utm_source=group_cta&utm_campaign=store_visit&start=store_demo&view=featured&button_clicked=online_store&from=telegram_group`
          }
        });
      }

      // Add second row if it has buttons
      if (secondRow.length > 0) {
        inlineKeyboard.push(secondRow);
      }

      // Third row - AI Chat and Upload
      const thirdRow = [];

      if (includeChatButton) {
        thirdRow.push({
          text: '🤖 יועץ AI חכם ליהלומים',
          web_app: {
            url: `https://diamondbot-store.vercel.app/chat?utm_source=group_cta&utm_campaign=ai_chat_demo&start=ai_chat_demo&welcome=true&button_clicked=ai_chat&from=telegram_group`
          }
        });
      }

      thirdRow.push({
        text: '📤 העלאת יהלומים מהירה',
        web_app: {
          url: `https://diamondbot-store.vercel.app/upload?utm_source=group_cta&utm_campaign=upload_demo&start=upload_demo&button_clicked=upload_diamonds&from=telegram_group`
        }
      });

      if (thirdRow.length > 0) {
        inlineKeyboard.push(thirdRow);
      }

    } else {
      // Single button fallback - routes to main dashboard
      inlineKeyboard = [[
        {
          text: '🚀 התחל עם BrilliantBot',
          web_app: {
            url: `https://diamondbot-store.vercel.app/?utm_source=group_cta&utm_campaign=single_button&start=group_activation&button_clicked=single_start&from=telegram_group`
          }
        }
      ]];
    }

    console.log('📤 Sending beautiful CTA message with', inlineKeyboard.length, 'button rows');
    
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

    console.log('✅ Enhanced Group CTA message with beautiful buttons sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        groupId: groupId || -1001009290613,
        buttonsCount: inlineKeyboard.length,
        beautifulDesign: true,
        hebrewMessage: true,
        functionalRouting: true,
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
