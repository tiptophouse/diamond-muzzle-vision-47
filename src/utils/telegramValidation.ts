
import { TelegramInitData } from '@/types/telegram';

export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    if (!initData || initData.length === 0) {
      console.warn('Empty initData provided');
      return null;
    }
    
    const urlParams = new URLSearchParams(initData);
    const data: any = {};
    
    urlParams.forEach((value, key) => {
      if (key === 'user') {
        try {
          const decodedValue = decodeURIComponent(value);
          data[key] = JSON.parse(decodedValue);
          console.log('Successfully parsed user data:', data[key]);
        } catch (userParseError) {
          console.error('Failed to parse user data:', userParseError);
          return null;
        }
      } else {
        data[key] = decodeURIComponent(value);
      }
    });
    
    // Enhanced validation
    if (data.user && data.user.id && typeof data.user.id === 'number') {
      console.log('✅ Valid Telegram initData parsed with user ID:', data.user.id);
      return data as TelegramInitData;
    } else {
      console.warn('⚠️ Parsed initData but missing valid user ID');
      return null;
    }
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string, botToken?: string): boolean {
  console.log('Enhanced Telegram initData validation');
  
  if (!initData || initData.length === 0) {
    console.warn('Missing or empty initData');
    return false;
  }
  
  try {
    const parsed = parseTelegramInitData(initData);
    const isValid = !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
    console.log('Validation result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Failed to validate Telegram initData:', error);
    return false;
  }
}

export function isTelegramWebApp(): boolean {
  const isWebApp = typeof window !== 'undefined' && 
    !!window.Telegram?.WebApp && 
    typeof window.Telegram.WebApp === 'object';
  
  console.log('Telegram WebApp detection:', {
    hasWindow: typeof window !== 'undefined',
    hasTelegram: !!window.Telegram,
    hasWebApp: !!window.Telegram?.WebApp,
    result: isWebApp
  });
  
  return isWebApp;
}

// Re-export the types for backward compatibility
export type { TelegramInitData } from '@/types/telegram';
