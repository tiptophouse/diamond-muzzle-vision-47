/**
 * Additional Callback Handlers for Auction Actions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildStatsMessage } from '../_shared/auction-message-builder.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CallbackQuery {
  id: string;
  from: { id: number; first_name: string; last_name?: string; };
  message: { chat: { id: number; }; message_id: number; };
  data: string;
}

export async function handleStats(query: CallbackQuery, auctionId: string) {
  try {
    // Fetch analytics
    const { data: analytics, error } = await supabase
      .from('auction_analytics')
      .select('event_type, telegram_id')
      .eq('auction_id', auctionId);

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return answerCallbackQuery(query.id, '❌ שגיאה בטעינת נתונים', true);
    }

    const stats = {
      views: analytics.filter(a => a.event_type === 'view').length,
      clicks: analytics.filter(a => a.event_type === 'click').length,
      bids: analytics.filter(a => a.event_type === 'bid_success').length,
      unique_bidders: new Set(
        analytics
          .filter(a => a.event_type === 'bid_success')
          .map(a => a.telegram_id)
      ).size,
    };

    const message = buildStatsMessage(stats);
    
    return answerCallbackQuery(query.id, message, true);
  } catch (error) {
    console.error('Error handling stats:', error);
    return answerCallbackQuery(query.id, '❌ שגיאה', true);
  }
}

export async function handleNotify(query: CallbackQuery, auctionId: string) {
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('auction_watchers')
      .select('id')
      .eq('auction_id', auctionId)
      .eq('telegram_id', query.from.id)
      .single();

    if (existing) {
      return answerCallbackQuery(query.id, '🔔 כבר רשום להתראות', true);
    }

    // Subscribe user to auction updates
    const { error } = await supabase
      .from('auction_watchers')
      .insert({
        auction_id: auctionId,
        telegram_id: query.from.id,
        user_name: `${query.from.first_name} ${query.from.last_name || ''}`.trim(),
      });

    if (error) {
      console.error('Failed to subscribe:', error);
      return answerCallbackQuery(query.id, '❌ שגיאה בהרשמה', true);
    }

    return answerCallbackQuery(query.id, '🔔 תקבל התראות על הצעות חדשות!', true);
  } catch (error) {
    console.error('Error handling notify:', error);
    return answerCallbackQuery(query.id, '❌ שגיאה', true);
  }
}

async function answerCallbackQuery(
  queryId: string,
  text: string,
  showAlert: boolean = false
) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: queryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (error) {
    console.error('Error answering callback query:', error);
  }
}
