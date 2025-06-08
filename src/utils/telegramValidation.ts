
import { TelegramInitData } from '@/types/telegram';
import crypto from 'crypto-js';

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
  console.log('Telegram initData validation');
  
  if (!initData || initData.length === 0) {
    console.warn('Missing or empty initData');
    return false;
  }

  // In development mode or when no bot token, just validate format
  if (process.env.NODE_ENV === 'development' || !botToken) {
    console.log('Development mode or no bot token - skipping signature validation');
    const parsed = parseTelegramInitData(initData);
    return !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
  }
  
  try {
    // Parse query parameters
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.warn('Missing hash in initData');
      return false;
    }
    
    // Remove hash from params for validation
    urlParams.delete('hash');
    
    // Create data check string
    const dataCheckArr: string[] = [];
    urlParams.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');
    
    // Validate HMAC signature
    const secretKey = crypto.HmacSHA256(botToken, 'WebAppData');
    const calculatedHash = crypto.HmacSHA256(dataCheckString, secretKey).toString();
    
    const isValid = calculatedHash === hash;
    console.log('HMAC validation result:', isValid);
    
    if (!isValid) {
      console.warn('Invalid Telegram signature');
      return false;
    }
    
    const parsed = parseTelegramInitData(initData);
    const isValidData = !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
    console.log('Final validation result:', isValidData);
    return isValidData;
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
