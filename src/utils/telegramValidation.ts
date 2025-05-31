
import { TelegramInitData } from '@/types/telegram';

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
  console.log('Telegram initData validation - skipping crypto validation for now');
  
  if (!initData) {
    console.warn('Missing initData');
    return false;
  }
  
  try {
    const parsed = parseTelegramInitData(initData);
    return !!parsed && !!parsed.user;
  } catch (error) {
    console.error('Failed to validate Telegram initData:', error);
    return false;
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

// Re-export the types for backward compatibility
export type { TelegramInitData } from '@/types/telegram';
