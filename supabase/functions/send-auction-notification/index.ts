import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';
import { sendDiamondCard, DiamondCardData } from '../_shared/diamond-card-template.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AuctionNotificationPayload {
  auction_id: string;
  recipient_telegram_id: number;
  notification_type: 'new_bid' | 'outbid' | 'winner' | 'auction_ended' | 'auction_starting';
  current_price?: number;
  bidder_name?: string;
  custom_message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const payload: AuctionNotificationPayload = await req.json();
    
    console.log('🔔 Auction notification request:', {
      auction_id: payload.auction_id,
      recipient: payload.recipient_telegram_id,
      type: payload.notification_type
    });

    // Fetch auction details with diamond data
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select(`
        *,
        inventory!fk_auction_diamond(
          id,
          stock_number,
          shape,
          weight,
          color,
          clarity,
          cut,
          price_per_carat,
          picture,
          gem360_url
        )
      `)
      .eq('id', payload.auction_id)
      .single();

    if (auctionError || !auction) {
      throw new Error('Auction not found');
    }

    const diamond = auction.inventory;
    if (!diamond) {
      throw new Error('Diamond data not found');
    }

    // Get best available image URL with exact same logic as store sharing
    let imageUrl = diamond.picture;
    
    if (imageUrl) {
      // Convert .html URLs to actual image URLs if needed
      if (imageUrl.includes('.html')) {
        imageUrl = `https://s3.eu-west-1.amazonaws.com/my360.fab/${diamond.stock_number}.jpg`;
      }
      
      // Ensure HTTPS for Telegram compatibility
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }
      
      console.log('🖼️ Image URL processed:', {
        original: diamond.picture?.substring(0, 50) + '...',
        processed: imageUrl?.substring(0, 50) + '...',
        isValid: imageUrl && (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.png') || imageUrl.endsWith('.webp'))
      });
      
      // Validate image URL format for Telegram
      if (!imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
        console.warn('⚠️ Invalid image format, sending text only');
        imageUrl = null;
      }
    }

    // Prepare diamond card data
    const diamondCardData: DiamondCardData = {
      id: diamond.id,
      stock_number: diamond.stock_number,
      shape: diamond.shape,
      weight: diamond.weight,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      price_per_carat: auction.current_price / diamond.weight,
      picture: imageUrl,
      gem360_url: diamond.gem360_url,
    };

    // Generate tracking ID for this notification
    const trackingId = crypto.randomUUID();
    const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'BrilliantBot_bot';

    // Create context-specific message and buttons
    let contextMessage = '';
    let additionalButtons: Array<{ text: string; url?: string; callback_data?: string }> = [];
    let eventType = '';

    switch (payload.notification_type) {
      case 'new_bid':
        contextMessage = `🎉 הצעה חדשה על המכרז שלך!\n💰 מחיר נוכחי: ${payload.current_price} ${auction.currency}\n👤 מציע: ${payload.bidder_name || 'Anonymous'}`;
        eventType = 'notification_new_bid_sent';
        additionalButtons = [
          {
            text: `📈 צפה במכרז (${auction.bid_count || 0} הצעות)`,
            url: `https://t.me/${botUsername}?startapp=auction_${auction.id}_track_${trackingId}`
          }
        ];
        break;

      case 'outbid':
        contextMessage = `⚡️ הוצאת מההובלה!\n💔 ההצעה שלך: $${payload.custom_message}\n💰 הצעה חדשה: ${payload.current_price} ${auction.currency}`;
        eventType = 'notification_outbid_sent';
        additionalButtons = [
          {
            text: `💰 הצע ${payload.current_price! + auction.min_increment} ${auction.currency}`,
            callback_data: `bid:${auction.id}:track_${trackingId}`
          },
          {
            text: '📈 צפה במכרז',
            url: `https://t.me/${botUsername}?startapp=auction_${auction.id}_track_${trackingId}`
          }
        ];
        break;

      case 'winner':
        contextMessage = `🎉 מזל טוב! זכית במכרז!\n💰 הצעה זוכה: ${payload.current_price} ${auction.currency}\nהמוכר ייצור איתך קשר בקרוב.`;
        eventType = 'notification_winner_sent';
        additionalButtons = [
          {
            text: '🏆 פרטי המכרז',
            url: `https://t.me/${botUsername}?startapp=auction_${auction.id}_track_${trackingId}`
          }
        ];
        break;

      case 'auction_ended':
        contextMessage = payload.custom_message || `⏰ המכרז הסתיים\n${auction.winner_telegram_id ? '✅ נמכר!' : '❌ ללא הצעות'}`;
        eventType = 'notification_ended_sent';
        additionalButtons = [
          {
            text: '📊 תוצאות מכרז',
            url: `https://t.me/${botUsername}?startapp=auction_${auction.id}_track_${trackingId}`
          }
        ];
        break;

      case 'auction_starting':
        contextMessage = payload.custom_message || `🔨 מכרז חדש מתחיל!\n💰 מחיר פתיחה: ${auction.starting_price} ${auction.currency}`;
        eventType = 'notification_starting_sent';
        additionalButtons = [
          {
            text: `💰 הצע ${auction.current_price + auction.min_increment} ${auction.currency}`,
            callback_data: `bid:${auction.id}:track_${trackingId}`
          },
          {
            text: '📈 צפה במכרז',
            url: `https://t.me/${botUsername}?startapp=auction_${auction.id}_track_${trackingId}`
          }
        ];
        break;
    }

    // Send diamond card using the template
    const result = await sendDiamondCard(
      payload.recipient_telegram_id,
      diamondCardData,
      {
        context: 'auction',
        customMessage: contextMessage,
        additionalButtons,
        botUsername,
      }
    );

    const responseTime = Date.now() - startTime;

    if (!result.success) {
      throw new Error(result.error || 'Failed to send notification');
    }

    // Track notification send with comprehensive data
    const { error: trackingError } = await supabase
      .from('auction_analytics')
      .insert({
        auction_id: payload.auction_id,
        telegram_id: payload.recipient_telegram_id,
        event_type: eventType,
        event_data: {
          tracking_id: trackingId,
          notification_type: payload.notification_type,
          message_id: result.messageId,
          current_price: payload.current_price,
          bidder_name: payload.bidder_name,
          response_time_ms: responseTime,
          has_image: !!imageUrl,
          image_url: imageUrl?.substring(0, 100),
          timestamp: new Date().toISOString(),
          buttons_sent: additionalButtons.length + 2, // +2 for default buttons
        },
      });

    if (trackingError) {
      console.warn('⚠️ Failed to track notification:', trackingError);
    }

    console.log(`✅ Auction notification sent in ${responseTime}ms`, {
      type: payload.notification_type,
      tracking_id: trackingId,
      message_id: result.messageId,
      has_image: !!imageUrl,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message_id: result.messageId,
        tracking_id: trackingId,
        response_time_ms: responseTime,
        notification_type: payload.notification_type,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error sending auction notification:', error);
    
    // Track failed notification - use payload data from try block
    const errorPayload: AuctionNotificationPayload = {
      auction_id: '',
      recipient_telegram_id: 0,
      notification_type: 'new_bid',
    };

    try {
      const bodyText = await req.text();
      const parsedPayload = JSON.parse(bodyText);
      Object.assign(errorPayload, parsedPayload);
    } catch (parseError) {
      console.warn('Could not parse error payload:', parseError);
    }

    if (errorPayload.auction_id && errorPayload.recipient_telegram_id) {
      try {
        await supabase.from('auction_analytics').insert({
          auction_id: errorPayload.auction_id,
          telegram_id: errorPayload.recipient_telegram_id,
          event_type: 'notification_failed',
          event_data: {
            error: error.message,
            response_time_ms: responseTime,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (trackError) {
        console.warn('Failed to track error:', trackError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        response_time_ms: responseTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
