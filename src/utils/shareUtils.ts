/**
 * Best practice utility functions for sharing functionality
 * Centralizes sharing logic with proper error handling and fallbacks
 */

export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

/**
 * Detects available sharing methods in order of preference
 */
export function getAvailableSharingMethods() {
  const methods: string[] = [];
  
  // Check Telegram Web App availability
  if ((window.Telegram?.WebApp as any)?.switchInlineQuery) {
    methods.push('telegram');
  }
  
  // Check Web Share API with proper feature detection
  if (navigator.share && navigator.canShare) {
    methods.push('webshare');
  }
  
  // Check clipboard API
  if (navigator.clipboard?.writeText) {
    methods.push('clipboard');
  }
  
  // Legacy clipboard always available as last resort
  methods.push('legacy');
  
  return methods;
}

/**
 * Formats share content consistently across the app
 */
export function formatShareContent(data: ShareData): string {
  return data.url ? `${data.title}\n\n${data.text}\n\n${data.url}` : `${data.title}\n\n${data.text}`;
}

/**
 * Validates if content can be shared via Web Share API
 */
export function canWebShare(data: ShareData): boolean {
  return !!(navigator.share && navigator.canShare?.({
    title: data.title,
    text: data.text,
    url: data.url || window.location.href
  }));
}

export interface DiamondShareUrls {
  webUrl: string;
  telegramUrl: string;
  shareUrl: string;
}

/**
 * Creates a proper Telegram deep link for sharing diamonds
 * Uses the public endpoint that works without JWT authentication
 */
export function createDiamondShareUrl(stockNumber: string, baseUrl?: string): DiamondShareUrls {
  const base = baseUrl || window.location.origin;
  // Create both public web URL and Telegram deep link
  return {
    // Public web URL for browsers/social media
    webUrl: `${base}/public/diamond/${encodeURIComponent(stockNumber)}`,
    // Telegram deep link that opens in the bot
    telegramUrl: `https://t.me/diamondmazalbot?startapp=diamond_${encodeURIComponent(stockNumber)}`,
    // Share-friendly URL for external sharing
    shareUrl: `${base}/public/diamond/${encodeURIComponent(stockNumber)}`
  };
}

/**
 * Generates formatted diamond share text with proper Telegram deep links
 */
export function formatDiamondShareText(diamond: {
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  price: number;
  stockNumber: string;
}): { title: string; text: string; telegramUrl: string; webUrl: string } {
  const title = `💎 ${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond`;
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(diamond.price);
  
  const shareUrls = createDiamondShareUrl(diamond.stockNumber);
  
  const text = `💎 Premium Diamond Available\n\n` +
    `📏 Weight: ${diamond.carat} carat\n` +
    `💠 Shape: ${diamond.shape}\n` +
    `🎨 Color: ${diamond.color}\n` +
    `✨ Clarity: ${diamond.clarity}\n` +
    `💰 Price: ${priceFormatted}\n` +
    `📦 Stock: ${diamond.stockNumber}\n\n` +
    `👆 Tap to view details`;
    
  return { 
    title, 
    text,
    telegramUrl: shareUrls.telegramUrl,
    webUrl: shareUrls.webUrl
  };
}

/**
 * Error messages for sharing failures with user-friendly text
 */
export const SHARE_ERROR_MESSAGES = {
  PERMISSION_DENIED: 'Sharing permission denied. Content has been copied to clipboard instead.',
  NETWORK_ERROR: 'Network error occurred while sharing. Please try again.',
  GENERIC_ERROR: 'Unable to share content at this time. Content copied to clipboard.',
  CLIPBOARD_FAILED: 'Failed to copy content to clipboard. Please copy manually.',
} as const;