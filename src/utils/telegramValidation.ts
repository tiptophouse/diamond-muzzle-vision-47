
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

export function validateTelegramInitData(initData: string): boolean {
  console.log('🔍 Validating Telegram initData...');
  
  if (!initData || initData.length === 0) {
    console.warn('Missing or empty initData');
    return false;
  }

  // In development mode, do basic validation only
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode - basic validation only');
    const parsed = parseTelegramInitData(initData);
    return !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
  }
  
  try {
    // Parse query parameters
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const authDate = urlParams.get('auth_date');
    
    if (!hash) {
      console.warn('Missing hash in initData');
      return false;
    }
    
    if (!authDate) {
      console.warn('Missing auth_date in initData');
      return false;
    }
    
    // Check if auth_date is not too old (24 hours)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - authDateTime > maxAge) {
      console.warn('InitData is too old');
      return false;
    }
    
    // Try to parse the user data
    const parsed = parseTelegramInitData(initData);
    const isValid = !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
    
    console.log('✅ InitData validation result:', isValid);
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
  
  console.log('🔍 Telegram WebApp detection:', {
    hasWindow: typeof window !== 'undefined',
    hasTelegram: !!window.Telegram,
    hasWebApp: !!window.Telegram?.WebApp,
    result: isWebApp
  });
  
  return isWebApp;
}

// Re-export the types for backward compatibility
export type { TelegramInitData } from '@/types/telegram';
