import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiamondGroupShareRequest {
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
    // CSV image fallbacks
    Image?: string;
    image?: string;
    picture?: string;
  };
  sharedBy: number;
  sharedByName?: string;
  testMode?: boolean;
}

serve(async (req) => {
  console.log('🚀 Diamond to group share function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('📥 Full request body:', requestBody);
    
    const { diamond, sharedBy, sharedByName, testMode }: DiamondGroupShareRequest = requestBody;
    
    console.log('📥 Request data:', { 
      diamondStock: diamond.stockNumber,
      sharedBy,
      sharedByName,
      testMode: !!testMode
    });

    if (!diamond || !sharedBy) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    console.log('🔑 Bot token available:', !!botToken);
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine target chat: personal chat for test mode, group for normal mode
    const targetChatId = testMode ? sharedBy : (Deno.env.get('B2B_GROUP_ID') || -1002178695748);
    const messagePrefix = testMode ? '🧪 **TEST MESSAGE** - ' : '';
    
    console.log(`📧 Sending diamond to ${testMode ? 'personal chat' : 'group'}: ${targetChatId}`);

    // Get sharer's name if not provided
    let sharerName = sharedByName;
    if (!sharerName) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('telegram_id', sharedBy)
        .single();
      
      if (userProfile) {
        sharerName = `${userProfile.first_name}${userProfile.last_name ? ` ${userProfile.last_name}` : ''}`;
      } else {
        sharerName = `User ${sharedBy}`;
      }
    }

    // Get best available image URL with validation
    let imageUrl = diamond.imageUrl || diamond.Image || diamond.image || diamond.picture;
    
    // Validate and fix image URL format
    if (imageUrl) {
      // Convert .html URLs to actual image URLs if needed
      if (imageUrl.includes('.html')) {
        const stockNumber = diamond.stockNumber;
        imageUrl = `https://s3.eu-west-1.amazonaws.com/my360.fab/${stockNumber}.jpg`;
      }
      
      // Ensure HTTPS for Telegram compatibility
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }
      
      console.log('🖼️ Image URL processed:', {
        original: diamond.imageUrl?.substring(0, 50) + '...',
        processed: imageUrl?.substring(0, 50) + '...',
        isValid: imageUrl && (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.png') || imageUrl.endsWith('.webp'))
      });
      
      // Validate image URL format for Telegram
      if (!imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
        console.warn('⚠️ Invalid image format, sending text only');
        imageUrl = null;
      }
    }

    // Create enhanced diamond share message with better formatting and bigger focus
    const priceText = diamond.price && diamond.price > 0 
      ? `💰 $${diamond.price.toLocaleString()}` 
      : '💰 צור קשר למחיר';
      
    const shareMessage = `${messagePrefix}✨💎 **${diamond.carat}ct ${diamond.shape.toUpperCase()} BRILLIANT** 💎✨

🏆 **יהלום פרמיום זמין עכשיו!**
*${diamond.color} צבע • ${diamond.clarity} ניקיון • ${diamond.cut} חיתוך*

💎 **${priceText}**

🔥 **למה הלקוח יבחר ביהלום הזה?**
• ✨ איכות פרמיום עם תעודת ${diamond.cut === 'EXCELLENT' ? 'מעולה' : diamond.cut}
• 📊 מדדי איכות מושלמים
• 🎯 מחיר תחרותי במיוחד
• ⚡ זמין לאספקה מיידית
• 🔒 אחריות מלאה ותעודה

📋 **מק"ט:** \`${diamond.stockNumber}\`
👤 **מוצע על ידי:** ${sharerName}

🎯 **רוצה לראות עוד פרטים? לחץ על הכפתורים למטה! 👇**
${testMode ? '\n🧪 *זו הודעת בדיקה - רק אתה רואה אותה*' : ''}`;

    // Check if diamond is in an active auction
    const { data: activeAuction } = await supabase
      .from('auctions')
      .select('id, ends_at')
      .eq('stock_number', diamond.stockNumber)
      .eq('status', 'active')
      .gt('ends_at', new Date().toISOString())
      .single();

    console.log('🔨 Active auction check:', { stockNumber: diamond.stockNumber, hasAuction: !!activeAuction });

    // Create inline keyboard with Telegram deep links (fixes the broken URLs)
    const appUrl = Deno.env.get('WEBAPP_URL') || 'https://miniapp.mazalbot.com';
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: testMode ? [
          // Personal chat - perfect deep links to Mini App
          [
            {
              text: '💎 פרטים מלאים + תמונות HD',
              web_app: { url: `${appUrl}?startapp=diamond_${diamond.stockNumber}_${sharedBy}` }
            }
          ],
          [
            {
              text: '💰 הצע מחיר',
              web_app: { url: `${appUrl}?startapp=offer_${diamond.stockNumber}_${sharedBy}` }
            }
          ],
          [
            {
              text: '📱 צור קשר',
              web_app: { url: `${appUrl}?startapp=contact_${diamond.stockNumber}_${sharedBy}` }
            },
            {
              text: '🏪 עוד יהלומים',
              web_app: { url: `${appUrl}?startapp=store_${sharedBy}` }
            }
          ]
        ] : (() => {
          // Group chat - perfect deep links that open in Mini App
          const buttons = [
            [
              {
                text: '💎 פרטים מלאים + תמונות HD',
                web_app: { url: `${appUrl}?startapp=diamond_${diamond.stockNumber}_${sharedBy}` }
              }
            ]
          ];

          // Add auction button if diamond is in active auction
          if (activeAuction) {
            buttons.push([
              {
                text: '🔨 מכרז פעיל - הצע עכשיו!',
                web_app: { url: `${appUrl}?startapp=auction_${activeAuction.id}` }
              }
            ]);
          }

          // Add make offer button for all diamonds
          buttons.push([
            {
              text: '💰 הצע מחיר ליהלום',
              web_app: { url: `${appUrl}?startapp=offer_${diamond.stockNumber}_${sharedBy}` }
            }
          ]);

          buttons.push([
            {
              text: '📱 צור קשר למוכר',
              web_app: { url: `${appUrl}?startapp=contact_${diamond.stockNumber}_${sharedBy}` }
            }
          ]);

          buttons.push([
            {
              text: '🏪 עוד יהלומים מהמוכר',
              web_app: { url: `${appUrl}?startapp=store_${sharedBy}` }
            },
            {
              text: '🤖 עזרה בבחירה',
              web_app: { url: `${appUrl}?startapp=ai_${diamond.stockNumber}` }
            }
          ]);

          return buttons;
        })()
      }
    };

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;
    console.log('📤 Message payload:', { 
      chat_id: targetChatId, 
      text: shareMessage.substring(0, 100) + '...', 
      parse_mode: 'Markdown',
      test_mode: !!testMode,
      hasImage: !!diamond.imageUrl
    });
    
    // Send diamond to target chat with enhanced error handling
    let response;
    if (imageUrl) {
      console.log('📸 Attempting to send with image:', imageUrl.substring(0, 50) + '...');
      
      try {
        // First try sending as photo
        response = await fetch(`${telegramApiUrl}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            photo: imageUrl,
            caption: shareMessage,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        });
        
        // Check if photo send failed
        const photoResult = await response.json();
        if (!response.ok || !photoResult.ok) {
          console.warn('📸 Photo send failed, falling back to text:', photoResult.description);
          
          // Fallback to text message
          response = await fetch(`${telegramApiUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChatId,
              text: `${shareMessage}\n\n🖼️ [תמונת היהלום זמינה במערכת]`,
              parse_mode: 'Markdown',
              ...inlineKeyboard
            })
          });
        } else {
          // Photo sent successfully, return the result
          const result = photoResult;
          console.log('✅ Photo sent successfully');
          return new Response(
            JSON.stringify({
              success: true,
              messageId: result.result.message_id,
              diamond: diamond,
              message: 'Diamond shared with image successfully'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      } catch (photoError) {
        console.warn('📸 Photo send error, falling back to text:', photoError);
        
        // Fallback to text message
        response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: `${shareMessage}\n\n📷 [תמונה זמינה באפליקציה]`,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        });
      }
    } else {
      console.log('📝 Sending text only (no image available)');
      // Send as text message
      response = await fetch(`${telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: shareMessage,
          parse_mode: 'Markdown',
          ...inlineKeyboard
        })
      });
    }

    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ Diamond shared to ${testMode ? 'personal chat' : 'group'} successfully:`, result.message_id);
      
      // Track the share in analytics
      try {
        await supabase.from('diamond_share_analytics').insert({
          diamond_stock_number: diamond.stockNumber,
          owner_telegram_id: sharedBy,
          viewer_telegram_id: null, // Group share, no specific viewer yet
          action_type: 'group_share_sent',
          session_id: crypto.randomUUID(),
          access_via_share: true,
          analytics_data: {
            group_share: !testMode,
            test_share: !!testMode,
            target_chat_id: targetChatId,
            share_timestamp: new Date().toISOString(),
            diamond_data: diamond,
            message_id: result.message_id
          }
        });
        console.log('✅ Share analytics tracked');
      } catch (analyticsError) {
        console.warn('⚠️ Failed to track share analytics:', analyticsError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          messageId: result.message_id,
          diamond: diamond,
          message: 'Diamond shared to group successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.error('❌ Failed to send diamond to group:', result);
      return new Response(
        JSON.stringify({
          success: false,
          error: result.description || 'Failed to send to group',
          details: result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

  } catch (error) {
    console.error('❌ Diamond group share error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send diamond to group'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});