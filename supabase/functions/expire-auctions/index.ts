import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🕐 Checking for expired auctions...');
    
    // Get expired auctions
    const { data: expiredAuctions, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .lt('ends_at', new Date().toISOString());
    
    if (error) throw error;
    
    console.log(`Found ${expiredAuctions?.length || 0} expired auctions`);
    
    for (const auction of expiredAuctions || []) {
      console.log(`⏰ Expiring auction ${auction.id}`);
      
      // Update status
      await supabase
        .from('auctions')
        .update({ status: 'ended' })
        .eq('id', auction.id);
      
      // Get top bid
      const { data: topBid } = await supabase
        .from('auction_bids')
        .select('*')
        .eq('auction_id', auction.id)
        .order('bid_amount', { ascending: false })
        .limit(1)
        .single();
      
      if (topBid) {
        // Update winner
        await supabase
          .from('auctions')
          .update({ winner_telegram_id: topBid.bidder_telegram_id })
          .eq('id', auction.id);
        
        // Notify winner
        await notifyWinner(topBid, auction);
        
        // Notify seller
        await notifySeller(auction, topBid);
      } else {
        // No bids - notify seller
        await notifySellerNoBids(auction);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        expired: expiredAuctions?.length || 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('❌ Error expiring auctions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function notifyWinner(bid: any, auction: any) {
  const message = `
🎉 *מזל טוב! זכית במכרז!*

💎 ${auction.stock_number}
💰 הצעה זוכה: $${bid.bid_amount}

המוכר יצור איתך קשר בקרוב.
`.trim();

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: bid.bidder_telegram_id,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log(`✅ Winner notified: ${bid.bidder_telegram_id}`);
  } catch (error) {
    console.error('Failed to notify winner:', error);
  }
}

async function notifySeller(auction: any, topBid: any) {
  const message = `
🔨 *המכרז הסתיים!*

💎 ${auction.stock_number}
👤 זוכה: ${topBid.bidder_name}
💰 מחיר סופי: $${topBid.bid_amount}
📊 סה"כ הצעות: ${auction.bid_count}

ניתן ליצור קשר עם הזוכה.
`.trim();

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: auction.seller_telegram_id,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log(`✅ Seller notified: ${auction.seller_telegram_id}`);
  } catch (error) {
    console.error('Failed to notify seller:', error);
  }
}

async function notifySellerNoBids(auction: any) {
  const message = `
⏰ *המכרז הסתיים*

💎 ${auction.stock_number}
📊 לא התקבלו הצעות

ניתן ליצור מכרז חדש או להתאים את המחיר.
`.trim();

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: auction.seller_telegram_id,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log(`✅ Seller notified (no bids): ${auction.seller_telegram_id}`);
  } catch (error) {
    console.error('Failed to notify seller:', error);
  }
}