import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchDiamondFromFastAPI } from '../_shared/fastapi-client.ts';
import { buildAuctionMessage, buildEnhancedInlineKeyboard, buildStatsMessage } from '../_shared/auction-message-builder.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'Brilliantteatbot';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CallbackQuery {
  id: string;
  from: { id: number; first_name: string; last_name?: string; };
  message: { chat: { id: number; }; message_id: number; };
  data: string;
}

export async function handleCallbackQuery(query: CallbackQuery) {
  const [action, auctionId] = query.data.split(':');
  
  console.log(`🔘 Callback: ${action} for auction ${auctionId}`);
  
  // Track all callback interactions
  await trackAnalytics(auctionId, query.from.id, 'click', query.message.chat.id, { action });
  
  if (action === 'bid') {
    return await handleBid(query, auctionId);
  }
  
  if (action === 'view') {
    await trackAnalytics(auctionId, query.from.id, 'view', query.message.chat.id);
    return answerCallbackQuery(query.id, '✅ פותח...', false);
  }

  if (action === 'stats') {
    return await handleStats(query, auctionId);
  }

  if (action === 'notify') {
    return await handleNotify(query, auctionId);
  }
  
  return new Response('OK', { status: 200 });
}

async function handleBid(query: CallbackQuery, auctionId: string) {
  try {
    // 1. Get auction
    const { data: auction, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();
    
    if (error || !auction) {
      console.error('Auction not found:', error);
      return answerCallbackQuery(query.id, '❌ מכרז לא נמצא', true);
    }
    
    if (auction.status !== 'active') {
      return answerCallbackQuery(query.id, '❌ המכרז הסתיים', true);
    }
    
    if (new Date(auction.ends_at) < new Date()) {
      return answerCallbackQuery(query.id, '❌ המכרז הסתיים', true);
    }
    
    // 2. Calculate next bid
    const nextBid = Number(auction.current_price) + Number(auction.min_increment);
    
    // 3. Check reserve price
    if (auction.reserve_price && nextBid < auction.reserve_price) {
      return answerCallbackQuery(query.id, `⚠️ מחיר מינימום: $${auction.reserve_price}`, true);
    }
    
    // 4. Verify user is registered
    const { data: user } = await supabase
      .from('user_profiles')
      .select('telegram_id')
      .eq('telegram_id', query.from.id)
      .single();
    
    if (!user) {
      console.log('User not registered:', query.from.id);
      return answerCallbackQuery(
        query.id,
        '⚠️ נא להירשם תחילה דרך הבוט',
        true
      );
    }
    
    // 5. Track bid attempt
    await trackAnalytics(auctionId, query.from.id, 'bid_attempt', query.message.chat.id, { bid_amount: nextBid });
    
    // 6. Insert bid
    const { error: bidError } = await supabase
      .from('auction_bids')
      .insert({
        auction_id: auctionId,
        bidder_telegram_id: query.from.id,
        bidder_name: `${query.from.first_name} ${query.from.last_name || ''}`.trim(),
        bid_amount: nextBid
      });
    
    if (bidError) {
      console.error('Bid insert error:', bidError);
      return answerCallbackQuery(query.id, '❌ שגיאה בהצעה', true);
    }
    
    // 7. Update auction
    const newBidCount = (auction.bid_count || 0) + 1;
    await supabase
      .from('auctions')
      .update({ 
        current_price: nextBid,
        bid_count: newBidCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', auctionId);
    
    // 8. Track success
    await trackAnalytics(auctionId, query.from.id, 'bid_success', query.message.chat.id, { 
      bid_amount: nextBid,
      bid_number: newBidCount 
    });
    
    // 9. Fetch fresh diamond data and update group message
    const diamond = await fetchDiamondFromFastAPI(auction.stock_number, auction.seller_telegram_id);
    
    await updateAuctionMessage(
      query.message.chat.id,
      query.message.message_id,
      {
        ...auction,
        current_price: nextBid,
        bid_count: newBidCount,
      },
      diamond
    );
    
    // 10. Notify seller
    if (auction.notify_seller) {
      await notifySeller(auction.seller_telegram_id, auction, query.from, nextBid);
    }
    
    return answerCallbackQuery(query.id, `✅ הצעה נקלטה: $${nextBid}`, true);
  } catch (error) {
    console.error('Bid handler error:', error);
    return answerCallbackQuery(query.id, '❌ שגיאה בהצעה', true);
  }
}

async function updateAuctionMessage(
  chatId: number,
  messageId: number,
  auction: any,
  newPrice: number,
  bidCount: number
) {
  const nextBid = newPrice + Number(auction.min_increment);
  const timeRemaining = calculateTimeRemaining(auction.ends_at);
  
  const diamondDesc = auction.diamond_data?.description || `📦 ${auction.stock_number}`;
  
  const updatedText = `
🔨 *מכרז פעיל*

💎 ${diamondDesc}

💰 *מחיר נוכחי: ${newPrice} ${auction.currency}*
📈 הצעה הבאה: ${nextBid} ${auction.currency}
👥 ${bidCount} הצעות
⏰ ${timeRemaining}

הצטרף למכרז! 👇
`.trim();

  const inlineKeyboard = [
    [{
      text: `💰 הצע ${nextBid} ${auction.currency}`,
      callback_data: `bid:${auction.id}`
    }],
    [{
      text: '👀 צפה ביהלום',
      web_app: { url: `https://t.me/${TELEGRAM_BOT_USERNAME}/app?startapp=diamond_${auction.stock_number}` }
    }, {
      text: '📈 ביצועים',
      web_app: { url: `https://t.me/${TELEGRAM_BOT_USERNAME}/app?startapp=auction_${auction.id}` }
    }]
  ];

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: updatedText,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: inlineKeyboard }
      })
    });
    console.log('✅ Message updated');
  } catch (error) {
    console.error('Failed to update message:', error);
  }
}

async function notifySeller(
  sellerTelegramId: number,
  auction: any,
  bidder: any,
  bidAmount: number
) {
  const message = `
🔔 *הצעה חדשה במכרז!*

💎 ${auction.stock_number}
👤 ${bidder.first_name} ${bidder.last_name || ''}
💰 $${bidAmount}
📊 סה"כ הצעות: ${auction.bid_count + 1}
`.trim();

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: sellerTelegramId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Failed to notify seller:', error);
  }
}

function answerCallbackQuery(
  callbackQueryId: string,
  text: string,
  showAlert = false
) {
  return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert
    })
  }).then(() => new Response('OK', { status: 200 }));
}

function calculateTimeRemaining(endsAt: string): string {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'הסתיים';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} ימים`;
  }
  
  return hours > 0 ? `${hours}ש ${minutes}ד` : `${minutes}ד`;
}

async function trackAnalytics(
  auctionId: string,
  telegramId: number,
  eventType: string,
  groupChatId: number,
  eventData: any = {}
) {
  try {
    await supabase.from('auction_analytics').insert({
      auction_id: auctionId,
      telegram_id: telegramId,
      event_type: eventType,
      event_data: eventData,
      group_chat_id: groupChatId
    });
    
    // Update auction stats
    if (eventType === 'view') {
      await supabase.rpc('increment_auction_views', { auction_id: auctionId });
    } else if (eventType === 'click') {
      await supabase.rpc('increment_auction_clicks', { auction_id: auctionId });
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}