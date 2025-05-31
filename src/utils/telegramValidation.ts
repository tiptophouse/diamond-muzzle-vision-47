
import crypto from 'crypto-js';

export interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
}

export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const data: any = {};
    
    urlParams.forEach((value, key) => {
      if (key === 'user') {
        data[key] = JSON.parse(decodeURIComponent(value));
      } else {
        data[key] = decodeURIComponent(value);
      }
    });
    
    return data as TelegramInitData;
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string, botToken?: string): boolean {
  if (!initData || !botToken) {
    console.warn('Missing initData or bot token for validation');
    return false;
  }
  
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key
    const secretKey = crypto.HmacSHA256(botToken, 'WebAppData');
    
    // Calculate hash
    const calculatedHash = crypto.HmacSHA256(dataCheckString, secretKey).toString();
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Failed to validate Telegram initData:', error);
    return false;
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}
