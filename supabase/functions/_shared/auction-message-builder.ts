/**
 * Auction Message Builder
 * Creates rich, professional auction messages with all diamond details
 */

import { DiamondData } from './fastapi-client.ts';

export interface AuctionData {
  id: string;
  stock_number: string;
  current_price: number;
  min_increment: number;
  currency: string;
  ends_at: string;
  bid_count: number;
  reserve_price?: number;
  seller_telegram_id: number;
}

export function buildAuctionMessage(
  diamond: DiamondData | null,
  auction: AuctionData,
  botUsername: string = 'Brilliantteatbot'
): string {
  if (!diamond) {
    return `🔨 *מכרז פעיל*\n\n💎 ${auction.stock_number}\n💰 *מחיר נוכחי: ${auction.current_price} ${auction.currency}*\n📈 הצעה הבאה: ${auction.current_price + auction.min_increment} ${auction.currency}\n⏰ ${calculateTimeRemaining(auction.ends_at)}\n\nהצטרף למכרז! 👇`;
  }

  // Build comprehensive diamond specs
  const specs = [
    `💎 ${diamond.weight}ct ${diamond.shape}`,
    `🎨 ${diamond.color} | ${diamond.clarity}`,
    diamond.cut ? `✨ ${diamond.cut}` : '',
    diamond.polish ? `💫 Polish: ${diamond.polish}` : '',
    diamond.symmetry ? `🔷 Symmetry: ${diamond.symmetry}` : '',
    diamond.fluorescence ? `🌟 Fluor: ${diamond.fluorescence}` : '',
    `📦 Stock: ${diamond.stock_number}`,
    diamond.certificate_number ? `📜 Cert: ${diamond.certificate_number}` : '',
    diamond.lab ? `🏛️ Lab: ${diamond.lab}` : '',
  ].filter(Boolean).join('\n');

  const auctionInfo = [
    `💰 *מחיר נוכחי: $${auction.current_price}*`,
    `📈 הצעה הבאה: $${auction.current_price + auction.min_increment}`,
    `👥 ${auction.bid_count || 0} הצעות`,
    `⏰ ${calculateTimeRemaining(auction.ends_at)}`,
    auction.reserve_price ? `🔒 מחיר סגירה: $${auction.reserve_price}` : '',
  ].filter(Boolean).join('\n');

  return `🔨 *מכרז פעיל*\n\n${specs}\n\n${auctionInfo}\n\nהצטרף למכרז! 👇`;
}

export function buildEnhancedInlineKeyboard(
  auctionId: string,
  stockNumber: string,
  nextBid: number,
  currency: string,
  botUsername: string = 'Brilliantteatbot'
) {
  const miniAppUrl = `https://t.me/${botUsername}?startapp=diamond_${stockNumber}`;
  const auctionUrl = `https://t.me/${botUsername}?startapp=auction_${auctionId}`;
  const storyShareUrl = `https://t.me/${botUsername}?startapp=story_auction_${auctionId}`;

  return [
    [
      {
        text: `💰 הצע $${nextBid}`,
        callback_data: `bid:${auctionId}`,
      },
    ],
    [
      {
        text: '👀 צפה ביהלום',
        callback_data: `view:${auctionId}`,
      },
      {
        text: '📊 ביצועים',
        callback_data: `stats:${auctionId}`,
      },
    ],
    [
      {
        text: '📱 שתף בסטורי',
        url: storyShareUrl,
      },
      {
        text: '📤 העבר לחבר',
        switch_inline_query: `diamond_${stockNumber}`,
      },
    ],
    [
      {
        text: '🔔 התראות',
        callback_data: `notify:${auctionId}`,
      },
    ],
  ];
}

export function calculateTimeRemaining(endsAt: string): string {
  const now = new Date().getTime();
  const end = new Date(endsAt).getTime();
  const diff = end - now;

  if (diff <= 0) return 'המכרז הסתיים';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} ימים נותרו`;
  }

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')} שעות נותרו`;
  }

  return `${minutes} דקות נותרו`;
}

export function buildStatsMessage(analytics: {
  views: number;
  clicks: number;
  bids: number;
  unique_bidders: number;
}): string {
  return `📊 *סטטיסטיקות מכרז*

👁 צפיות: ${analytics.views}
👆 קליקים: ${analytics.clicks}
💰 הצעות: ${analytics.bids}
👥 משתתפים: ${analytics.unique_bidders}

המכרז פעיל! 🚀`;
}
