import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { editDiamondCard, DiamondCardData } from '../_shared/diamond-card-template.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME');

interface CallbackQuery {
  id: string;
  from: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  message?: {
    message_id: number;
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
  data: string;
  inline_message_id?: string;
}

/**
 * Handle Telegram callback queries (button clicks)
 * Format: "bid:auction_id:track_tracking_id" or "bid:auction_id"
 */
export async function handleCallbackQuery(callbackQuery: CallbackQuery) {
  const { id, from, data, message } = callbackQuery;
  const startTime = Date.now();
  
  try {
    // Parse callback data
    const parts = data.split(':');
    const action = parts[0];
    const auctionId = parts[1];
    const trackingParam = parts[2]; // Optional: "track_tracking_id"
    
    const trackingId = trackingParam?.replace('track_', '') || null;

    console.log('🔘 Callback query:', { action, auctionId, trackingId, userId: from.id });

    // Track button click
    await supabase.from('auction_analytics').insert({
      auction_id: auctionId,
      telegram_id: from.id,
      event_type: 'button_clicked',
      event_data: {
        action,
        tracking_id: trackingId,
        button_data: data,
        clicked_at: new Date().toISOString(),
        from_notification: !!trackingId,
      },
    });

    if (action === 'bid') {
      return await handleBidCallback(callbackQuery, auctionId, trackingId, startTime);
    }

    // Unknown action
    await answerCallbackQuery(id, '❓ פעולה לא מוכרת', false);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Error handling callback:', error);
    await answerCallbackQuery(id, '❌ שגיאה, נסה שוב', true);
    return new Response('OK', { status: 200 });
  }
}

/**
 * Handle bid button callback
 */
async function handleBidCallback(
  callbackQuery: CallbackQuery,
  auctionId: string,
  trackingId: string | null,
  startTime: number
) {
  const { id, from, message } = callbackQuery;

  try {
    // Step 1: Fetch auction with diamond data
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
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      await answerCallbackQuery(id, '❌ המכרז לא נמצא', true);
      return new Response('OK', { status: 200 });
    }

    // Step 2: Validate auction status
    if (auction.status !== 'active') {
      await answerCallbackQuery(id, '⏰ המכרז הסתיים', true);
      return new Response('OK', { status: 200 });
    }

    if (new Date(auction.ends_at) < new Date()) {
      await answerCallbackQuery(id, '⏰ הזמן תם', true);
      return new Response('OK', { status: 200 });
    }

    // Step 3: Check if user is the seller
    if (auction.seller_telegram_id === from.id) {
      await answerCallbackQuery(id, '🚫 אי אפשר להציע על המכרז שלך', true);
      
      // Track failed bid attempt
      await supabase.from('auction_analytics').insert({
        auction_id: auctionId,
        telegram_id: from.id,
        event_type: 'bid_failed',
        event_data: {
          reason: 'seller_cannot_bid',
          tracking_id: trackingId,
          timestamp: new Date().toISOString(),
        },
      });
      
      return new Response('OK', { status: 200 });
    }

    // Step 4: Rate limiting - prevent spam (5 second cooldown)
    const { data: recentBid } = await supabase
      .from('auction_bids')
      .select('created_at')
      .eq('bidder_telegram_id', from.id)
      .eq('auction_id', auctionId)
      .gte('created_at', new Date(Date.now() - 5000).toISOString())
      .limit(1)
      .single();

    if (recentBid) {
      await answerCallbackQuery(id, '⏳ המתן מעט לפני הצעה נוספת', true);
      return new Response('OK', { status: 200 });
    }

    // Step 5: Calculate next bid
    const nextBidAmount = auction.current_price + auction.min_increment;

    // Step 6: Insert bid
    const { data: bid, error: bidError } = await supabase
      .from('auction_bids')
      .insert({
        auction_id: auctionId,
        bidder_telegram_id: from.id,
        bidder_name: `${from.first_name} ${from.last_name || ''}`.trim(),
        bid_amount: nextBidAmount,
      })
      .select()
      .single();

    if (bidError) {
      console.error('❌ Failed to insert bid:', bidError);
      await answerCallbackQuery(id, '❌ ההצעה נכשלה, נסה שוב', true);
      
      // Track failed bid
      await supabase.from('auction_analytics').insert({
        auction_id: auctionId,
        telegram_id: from.id,
        event_type: 'bid_failed',
        event_data: {
          reason: 'database_error',
          error: bidError.message,
          tracking_id: trackingId,
          timestamp: new Date().toISOString(),
        },
      });
      
      return new Response('OK', { status: 200 });
    }

    // Step 7: Update auction current_price and bid_count
    const { error: updateError } = await supabase
      .from('auctions')
      .update({
        current_price: nextBidAmount,
        bid_count: (auction.bid_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId);

    if (updateError) {
      console.error('❌ Failed to update auction:', updateError);
    }

    const responseTime = Date.now() - startTime;

    // Step 8: Track successful bid with comprehensive data
    await supabase.from('auction_analytics').insert({
      auction_id: auctionId,
      telegram_id: from.id,
      event_type: 'bid_success',
      event_data: {
        bid_amount: nextBidAmount,
        bid_id: bid.id,
        tracking_id: trackingId,
        response_time_ms: responseTime,
        from_notification: !!trackingId,
        previous_price: auction.current_price,
        timestamp: new Date().toISOString(),
      },
    });

    // Step 9: Answer callback query
    await answerCallbackQuery(id, `✅ הצעה התקבלה! $${nextBidAmount}`, false);

    // Step 10: Edit message with updated info
    if (message) {
      const diamond = auction.inventory;
      const diamondData: DiamondCardData = {
        id: diamond.id,
        stock_number: diamond.stock_number,
        shape: diamond.shape,
        weight: diamond.weight,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        price_per_carat: nextBidAmount / diamond.weight,
        picture: diamond.picture,
        gem360_url: diamond.gem360_url,
      };

      const endsAt = new Date(auction.ends_at);
      const timeRemaining = Math.floor((endsAt.getTime() - Date.now()) / (1000 * 60 * 60));

      await editDiamondCard(
        message.chat.id,
        message.message_id,
        diamondData,
        {
          context: 'auction',
          customMessage: `💰 מחיר נוכחי: ${nextBidAmount} ${auction.currency}\n📈 הצעה הבאה: ${nextBidAmount + auction.min_increment} ${auction.currency}\n⏰ זמן נותר: ~${timeRemaining} שעות\n🔥 ${(auction.bid_count || 0) + 1} הצעות`,
          additionalButtons: [
            {
              text: `💰 הצע ${nextBidAmount + auction.min_increment} ${auction.currency}`,
              callback_data: `bid:${auctionId}`,
            },
          ],
          includeStoreButton: false, // Don't show store button in auctions
          botUsername,
        }
      );
    }

    // Step 11: Notify seller (invoke notification function)
    await supabase.functions.invoke('send-auction-notification', {
      body: {
        auction_id: auctionId,
        recipient_telegram_id: auction.seller_telegram_id,
        notification_type: 'new_bid',
        current_price: nextBidAmount,
        bidder_name: `${from.first_name} ${from.last_name || ''}`.trim(),
      },
    });

    // Step 12: Notify previous highest bidder they've been outbid
    const { data: previousBid } = await supabase
      .from('auction_bids')
      .select('bidder_telegram_id, bid_amount')
      .eq('auction_id', auctionId)
      .lt('bid_amount', nextBidAmount)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (previousBid && previousBid.bidder_telegram_id !== from.id) {
      await supabase.functions.invoke('send-auction-notification', {
        body: {
          auction_id: auctionId,
          recipient_telegram_id: previousBid.bidder_telegram_id,
          notification_type: 'outbid',
          current_price: nextBidAmount,
          custom_message: previousBid.bid_amount.toString(),
        },
      });
    }

    console.log(`✅ Bid processed in ${responseTime}ms:`, {
      auction_id: auctionId,
      bidder: from.id,
      amount: nextBidAmount,
      tracking_id: trackingId,
    });

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Error processing bid:', error);
    await answerCallbackQuery(id, '❌ משהו השתבש', true);
    return new Response('OK', { status: 200 });
  }
}

/**
 * Answer callback query (remove loading state)
 */
async function answerCallbackQuery(
  callbackQueryId: string,
  text: string,
  showAlert: boolean
): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${telegramBotToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (error) {
    console.warn('Failed to answer callback query:', error);
  }
}
