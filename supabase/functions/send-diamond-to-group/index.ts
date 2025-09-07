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

    // Get best available image URL with enhanced fallbacks and validation
    let imageUrl = diamond.imageUrl || diamond.Image || diamond.image || diamond.picture;
    let enhancedImageData = null;
    let useAnimatedVersion = false;
    
    // Enhanced image URL processing with professional enhancement
    if (imageUrl) {
      console.log('🎨 Processing diamond image for professional display');
      
      try {
        // Call image enhancement service for better presentation
        const enhancementResponse = await supabase.functions.invoke('enhance-diamond-image', {
          body: {
            imageUrl,
            diamondData: {
              shape: diamond.shape,
              carat: diamond.carat,
              stockNumber: diamond.stockNumber
            },
            options: {
              addAnimation: true, // Request rotational animation
              addFrame: true,
              optimize: true
            }
          }
        });

        if (enhancementResponse.data?.success) {
          enhancedImageData = enhancementResponse.data.data;
          
          // Use enhanced URL if available and accessible
          if (enhancedImageData.isAccessible && enhancedImageData.enhancedUrl) {
            imageUrl = enhancedImageData.enhancedUrl;
            useAnimatedVersion = enhancedImageData.presentation.shouldAnimate;
            
            console.log('✨ Enhanced image ready:', {
              provider: enhancedImageData.optimization.provider,
              animated: useAnimatedVersion,
              enhanced: enhancedImageData.optimization.hasQualityParams
            });
          }
        }
      } catch (enhancementError) {
        console.warn('⚠️ Image enhancement failed, using original:', enhancementError.message);
        // Continue with original image processing
      }

      // Validate diamond industry image URLs
      if (imageUrl.includes('segoma.com')) {
        console.log('✅ Segoma diamond image detected:', imageUrl.substring(0, 50) + '...');
      }
      else if (imageUrl.includes('sarine.com') || imageUrl.includes('gcal.com') || 
               imageUrl.includes('gemfacts.com') || imageUrl.includes('my360.fab') ||
               imageUrl.includes('gia.edu') || imageUrl.includes('gsi.net')) {
        console.log('✅ Trusted diamond image provider detected:', imageUrl.substring(0, 50) + '...');
      }
      else if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
        console.log('✅ Standard image format detected:', imageUrl.substring(0, 50) + '...');
      }
      else {
        console.log('⚠️ Unknown image format, will attempt to send:', imageUrl.substring(0, 50) + '...');
      }
    }
    
    console.log('🖼️ Enhanced Image processing results:', {
      originalImageUrl: !!diamond.imageUrl,
      Image: !!diamond.Image, 
      image: !!diamond.image,
      picture: !!diamond.picture,
      processedUrl: !!imageUrl,
      enhanced: !!enhancedImageData,
      animated: useAnimatedVersion,
      accessible: enhancedImageData?.isAccessible,
      provider: enhancedImageData?.optimization?.provider,
      urlPreview: imageUrl ? imageUrl.substring(0, 60) + '...' : 'none'
    });

    // Create professional diamond share message with better formatting
    const priceDisplay = diamond.price && diamond.price > 0 ? 
      `$${diamond.price.toLocaleString()}` : 
      'צור קשר למחיר 📞';
    
    const shareMessage = `${messagePrefix}💎 *יהלום איכותי זמין להשקעה*

┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✨ *פרטי היהלום המלאים* ✨  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

💍 *משקל:* ${diamond.carat} קראט
🔶 *צורה:* ${diamond.shape}
🌈 *צבע:* ${diamond.color}
💎 *ניקיון:* ${diamond.clarity}
⚡ *איכות חיתוך:* ${diamond.cut}
💰 *מחיר:* ${priceDisplay}

👨‍💼 *מוצע על ידי:* ${sharerName}
🏷️ *מק״ט:* ${diamond.stockNumber}

🔥 *לפרטים מלאים, צפייה ב-360° ויצירת קשר - השתמש בכפתורים למטה* ⬇️`;

    // Create inline keyboard with working URL buttons only
    const baseUrl = 'https://uhhljqgxhdhbbhpohxll.supabase.co';
    const telegramBotUrl = `https://t.me/${Deno.env.get('TELEGRAM_BOT_USERNAME') || 'BrilliantBot_bot'}`;
    
    // Create responsive inline keyboard optimized for mobile
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: testMode ? [
          // Personal chat - can use web_app buttons (2x2 responsive layout)
          [
            {
              text: '💎 פרטים מלאים',
              web_app: {
                url: `${baseUrl}/diamond/${diamond.stockNumber}?shared=true&from=${sharedBy}&verify=true`
              }
            },
            {
              text: '📱 צור קשר',
              url: `${telegramBotUrl}?start=contact_${diamond.stockNumber}_${sharedBy}`
            }
          ],
          [
            {
              text: '🔄 צפייה 360°',
              url: diamond.gem360Url || `${baseUrl}/diamond/${diamond.stockNumber}?view=360&shared=true&from=${sharedBy}`
            },
            {
              text: '📝 הרשמה',
              web_app: {
                url: `${baseUrl}/?register=true&from=${sharedBy}`
              }
            }
          ]
        ] : [
          // Group chat - URL buttons only (responsive 2x2 then 1x1 layout)
          [
            {
              text: '💎 פרטים ומחיר מלא',
              url: `${baseUrl}/diamond/${diamond.stockNumber}?shared=true&from=${sharedBy}&verify=true`
            },
            {
              text: '📱 צור קשר ישיר',
              url: `${telegramBotUrl}?start=contact_${diamond.stockNumber}_${sharedBy}`
            }
          ],
          [
            {
              text: '🔄 צפייה 360°',
              url: diamond.gem360Url || `${baseUrl}/diamond/${diamond.stockNumber}?view=360&shared=true&from=${sharedBy}`
            },
            {
              text: '🏪 עוד יהלומים',
              url: `${baseUrl}/?seller=${sharedBy}&shared=true`
            }
          ],
          [
            {
              text: '⭐ הצטרף לפלטפורמה',
              url: `${telegramBotUrl}?start=register_from_${sharedBy}`
            }
          ]
        ]
      }
    };

    console.log('🔗 Generated URLs for debugging:', {
      detailsUrl: `${baseUrl}/diamond/${diamond.stockNumber}`,
      contactUrl: `${telegramBotUrl}?start=contact_${diamond.stockNumber}_${sharedBy}`,
      gem360Url: diamond.gem360Url,
      stockNumber: diamond.stockNumber,
      diamondId: diamond.id
    });
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;
    console.log('📤 Message payload:', { 
      chat_id: targetChatId, 
      text: shareMessage.substring(0, 100) + '...', 
      parse_mode: 'Markdown',
      test_mode: !!testMode,
      hasImage: !!imageUrl,
      buttonCount: testMode ? 4 : 5
    });
    
    // Send diamond to target chat with enhanced image presentation
    let response;
    if (imageUrl) {
      console.log('📸 Sending with enhanced image:', {
        url: imageUrl.substring(0, 50) + '...',
        animated: useAnimatedVersion,
        enhanced: !!enhancedImageData
      });

      // Create enhanced message with better visual presentation
      const enhancedMessage = `${messagePrefix}💎 *יהלום איכותי זמין להשקעה* ✨

┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    🔥 *יהלום מושלם* 🔥    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

💍 *${diamond.carat} קראט* | 🔶 *${diamond.shape}*
🌈 *${diamond.color}* | 💎 *${diamond.clarity}* | ⚡ *${diamond.cut}*
💰 *${priceDisplay}*

👨‍💼 *מוצע על ידי:* ${sharerName}
🏷️ *מק״ט:* ${diamond.stockNumber}

${useAnimatedVersion ? '🔄 *תמונה מסתובבת - לחץ לפרטים מלאים*' : ''}
🔥 *השתמש בכפתורים למטה לפרטים ויצירת קשר* ⬇️`;

      // Try sending as animation if we have animated version
      if (useAnimatedVersion && enhancedImageData?.animationUrl) {
        console.log('🔄 Attempting animated presentation');
        response = await fetch(`${telegramApiUrl}/sendAnimation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            animation: enhancedImageData.animationUrl,
            caption: enhancedMessage,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        }).catch(async (error) => {
          console.log('⚠️ Animation failed, falling back to photo:', error.message);
          // Fallback to regular photo
          return fetch(`${telegramApiUrl}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChatId,
              photo: imageUrl,
              caption: enhancedMessage,
              parse_mode: 'Markdown',
              ...inlineKeyboard
            })
          });
        });
      } else {
        // Send as enhanced photo
        response = await fetch(`${telegramApiUrl}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            photo: imageUrl,
            caption: enhancedMessage,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        });
      }
    } else {
      console.log('📝 Sending text only (no image available)');
      // Send as text message with enhanced formatting
      const noImageMessage = `${shareMessage}

⚠️ *תמונת היהלום לא זמינה כרגע*
📞 *צור קשר לקבלת תמונות ופרטים נוספים*`;

      response = await fetch(`${telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: noImageMessage,
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