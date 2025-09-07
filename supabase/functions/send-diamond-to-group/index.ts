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

    // Get the first available image URL directly - no complex enhancement
    const imageUrl = diamond.imageUrl || diamond.Image || diamond.image || diamond.picture;
    
    console.log('🖼️ Simple image processing:', {
      imageUrl: !!imageUrl,
      urlPreview: imageUrl ? imageUrl.substring(0, 60) + '...' : 'none',
      has360: !!diamond.gem360Url
    });

    // Simple diamond details text
    const priceDisplay = diamond.price && diamond.price > 0 ? 
      `$${diamond.price.toLocaleString()}` : 
      'Contact for price';
    
    const shareMessage = `${messagePrefix}💎 ${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond - Mazalbot

💎 ${diamond.carat}ct ${diamond.shape} Diamond

🎨 ${diamond.color} • 💎 ${diamond.clarity} • ✂️ ${diamond.cut}
💰 ${priceDisplay}
📋 Stock #${diamond.stockNumber}

Shared by: ${sharerName}`;

    // Simple inline keyboard - just 2-3 buttons
    const baseUrl = 'https://diamond-mazal-vision-47.lovable.app';
    const telegramBotUrl = `https://t.me/diamondmazalbot`;
    
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💎 View Details',
              url: `${baseUrl}/diamond/${diamond.stockNumber}`
            },
            {
              text: '📱 Contact Seller',
              url: `${telegramBotUrl}?start=contact_${diamond.stockNumber}`
            }
          ]
        ]
      }
    };

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;
    console.log('📤 Simple message - Image → Text → Inline buttons');
    
    // Send message: Image first, then text as caption, then inline buttons
    let response;
    if (imageUrl) {
      console.log('📸 Sending real diamond image:', imageUrl.substring(0, 50) + '...');
      
      // Send photo with caption (simple Image → Text → Inline buttons structure)
      response = await fetch(`${telegramApiUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          photo: imageUrl,
          caption: shareMessage,
          ...inlineKeyboard
        })
      });
    } else {
      console.log('📝 No image available - sending text only');
      
      // Send text message with inline buttons
      response = await fetch(`${telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: shareMessage + '\n\n⚠️ Image not available',
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