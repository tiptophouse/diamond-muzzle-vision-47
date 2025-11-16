/**
 * Deep Link Utilities for Telegram Mini App
 * Ensures correct format for all deep links
 */

/**
 * Remove leading '@' from bot username if present
 */
export function sanitizeBotUsername(username: string): string {
  return username.startsWith('@') ? username.substring(1) : username;
}

/**
 * Build a Telegram Mini App deep link
 * Format: https://t.me/{botUsername}/app?startapp={encodedParam}
 */
export function buildMiniAppDeepLink(botUsername: string, startParam: string): string {
  const cleanUsername = sanitizeBotUsername(botUsername);
  const encodedParam = encodeURIComponent(startParam);
  return `https://t.me/${cleanUsername}/app?startapp=${encodedParam}`;
}

/**
 * Build a Web App URL with start parameter
 * Format: {WEBAPP_URL}?tgWebAppStartParam={encodedParam}
 */
export function buildWebAppUrl(webAppBaseUrl: string, startParam: string): string {
  const encodedParam = encodeURIComponent(startParam);
  return `${webAppBaseUrl}?tgWebAppStartParam=${encodedParam}`;
}

/**
 * Create an inline keyboard button for Mini App
 * Uses url with t.me deep link for proper mini app launch
 */
export function createMiniAppButton(text: string, botUsername: string, startParam: string) {
  return {
    text,
    url: buildMiniAppDeepLink(botUsername, startParam)
  };
}

/**
 * Create a fallback URL button for deep links
 * Uses standard URL button
 */
export function createFallbackButton(text: string, deepLink: string) {
  return {
    text,
    url: deepLink
  };
}
