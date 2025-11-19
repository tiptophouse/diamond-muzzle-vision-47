import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiamondGroupShareRequest {
  diamond: {
    // New FastAPI fields
    diamond_id?: number;
    stock_number?: string;
    weight?: number;
    price_per_carat?: number;
    gem_360_url?: string;
    // Old frontend fields (backward compatibility)
    id?: string;
    stockNumber?: string;
    carat?: number;
    price?: number;
    imageUrl?: string;
    gem360Url?: string;
    // Common fields
    shape: string;
    color: string;
    clarity: string;
    cut: string;
    // CSV image fallbacks
    Image?: string;
    image?: string;
    picture?: string;
  };
  sharedBy: number;
  sharedByName?: string;
  testMode?: boolean;
  customMessage?: string;
}

serve(async (req) => {
  console.log('🚀 Diamond to group share function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('📥 Full request body:', requestBody);
    
    const { diamond, sharedBy, sharedByName, testMode, customMessage }: DiamondGroupShareRequest = requestBody;
    
    // Normalize diamond data to handle both old and new field names
    const normalizedDiamond = {
      id: diamond.diamond_id?.toString() || diamond.id,
      stockNumber: diamond.stock_number || diamond.stockNumber || '',
      carat: diamond.weight || diamond.carat || 0,
      shape: diamond.shape,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      price: diamond.price || (diamond.price_per_carat && diamond.weight ? diamond.price_per_carat * diamond.weight : 0),
      imageUrl: diamond.picture || diamond.imageUrl || diamond.Image || diamond.image,
      gem360Url: diamond.gem_360_url || diamond.gem360Url
    };
    
    console.log('📥 Request data:', { 
      diamondStock: normalizedDiamond.stockNumber,
      carat: normalizedDiamond.carat,
      price: normalizedDiamond.price,
      sharedBy,
      sharedByName,
      testMode: !!testMode
    });

    if (!normalizedDiamond.stockNumber || !sharedBy) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: stockNumber and sharedBy are required' }),
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
    let imageUrl = normalizedDiamond.imageUrl;
    
    // Validate and fix image URL format
    if (imageUrl) {
      // Convert .html URLs to actual image URLs if needed
      if (imageUrl.includes('.html')) {
        imageUrl = `https://s3.eu-west-1.amazonaws.com/my360.fab/${normalizedDiamond.stockNumber}.jpg`;
      }
      
      // Ensure HTTPS for Telegram compatibility
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }
      
      console.log('🖼️ Image URL processed:', {
        original: normalizedDiamond.imageUrl?.substring(0, 50) + '...',
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
    const priceText = normalizedDiamond.price && normalizedDiamond.price > 0 
      ? `💰 $${normalizedDiamond.price.toLocaleString()}` 
      : '💰 צור קשר למחיר';
    
    const customMessageText = customMessage ? `\n\n📝 **הודעה מהמוכר:**\n${customMessage}\n` : '';
      
    const shareMessage = `${messagePrefix}✨💎 **${normalizedDiamond.carat}ct ${normalizedDiamond.shape.toUpperCase()} BRILLIANT** 💎✨

🏆 **יהלום פרמיום זמין עכשיו!**
*${normalizedDiamond.color} צבע • ${normalizedDiamond.clarity} ניקיון • ${normalizedDiamond.cut} חיתוך*

💎 **${priceText}**

🔥 **למה הלקוח יבחר ביהלום הזה?**
• ✨ איכות פרמיום עם תעודת ${normalizedDiamond.cut === 'EXCELLENT' ? 'מעולה' : normalizedDiamond.cut}
• 📊 מדדי איכות מושלמים
• 🎯 מחיר תחרותי במיוחד
• ⚡ זמין לאספקה מיידית
• 🔒 אחריות מלאה ותעודה
${customMessageText}
📋 **מק"ט:** \`${normalizedDiamond.stockNumber}\`
👤 **מוצע על ידי:** ${sharerName}

🎯 **רוצה לראות עוד פרטים? לחץ על הכפתורים למטה! 👇**
${testMode ? '\n🧪 *זו הודעת בדיקה - רק אתה רואה אותה*' : ''}`;

    // Check if diamond is in an active auction
    const { data: activeAuction } = await supabase
      .from('auctions')
      .select('id, ends_at')
      .eq('stock_number', normalizedDiamond.stockNumber)
      .eq('status', 'active')
      .gt('ends_at', new Date().toISOString())
      .single();

    console.log('🔨 Active auction check:', { stockNumber: normalizedDiamond.stockNumber, hasAuction: !!activeAuction });

    // Create inline keyboard with Telegram deep links (fixes the broken URLs)
    const telegramBotUrl = `https://t.me/${Deno.env.get('TELEGRAM_BOT_USERNAME') || 'diamondmazalbot'}`;
    const baseUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://brilliantbot.lovable.app';
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: testMode ? [
          // Personal chat - use web_app with proper deep links
          [
            {
              text: '💎 פרטים מלאים',
              web_app: {
                url: `${telegramBotUrl}/app?startapp=diamond_${normalizedDiamond.stockNumber}_${sharedBy}`
              }
            }
          ],
          [
            {
              text: '📱 צור קשר',
              url: `${telegramBotUrl}?start=contact_${normalizedDiamond.stockNumber}_${sharedBy}`
            }
          ],
          [
            {
              text: '🏪 עוד יהלומים מהמוכר',
              url: `${telegramBotUrl}?startapp=store_${sharedBy}`
            }
          ]
        ] : (() => {
          // Group chat - use Telegram deep links that actually work
          const buttons = [
            [
              {
                text: '💎 פרטים מלאים + תמונות HD',
                url: `${telegramBotUrl}?startapp=diamond_${normalizedDiamond.stockNumber}_${sharedBy}`
              }
            ]
          ];

          // Add auction button if diamond is in active auction
          if (activeAuction) {
            buttons.push([
              {
                text: '🔨 הצע מחיר במכרז',
                web_app: {
                  url: `${baseUrl}/public/auction/${activeAuction.id}?shared=true`
                }
              }
            ]);
          }

          buttons.push([
            {
              text: '📱 צור קשר למחיר ולפרטים',
              url: `${telegramBotUrl}?start=contact_${normalizedDiamond.stockNumber}_${sharedBy}`
            }
          ]);

          buttons.push([
            {
              text: '🏪 עוד יהלומים מהמוכר',
              url: `${telegramBotUrl}?startapp=store_${sharedBy}`
            },
            {
              text: '🤖 עזרה בבחירה',
              url: `${telegramBotUrl}?start=ai_assistant_${normalizedDiamond.stockNumber}`
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
      hasImage: !!imageUrl
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
          diamond_stock_number: normalizedDiamond.stockNumber,
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
            diamond_data: normalizedDiamond,
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
          diamond: normalizedDiamond,
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