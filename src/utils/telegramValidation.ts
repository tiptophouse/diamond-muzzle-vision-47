
import { TelegramInitData } from '@/types/telegram';

export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    if (!initData || initData.length === 0) {
      console.warn('❌ Empty initData provided to parser');
      return null;
    }
    
    console.log('🔍 Parsing initData string (length:', initData.length, ')');
    console.log('🔍 Raw initData preview:', initData.substring(0, 200) + (initData.length > 200 ? '...' : ''));
    
    const urlParams = new URLSearchParams(initData);
    const data: any = {};
    
    // Log all available parameters
    console.log('🔍 Available initData parameters:');
    urlParams.forEach((value, key) => {
      console.log(`  - ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    });
    
    urlParams.forEach((value, key) => {
      if (key === 'user') {
        try {
          const decodedValue = decodeURIComponent(value);
          console.log('🔍 Decoding user parameter:', decodedValue);
          const userObj = JSON.parse(decodedValue);
          console.log('🔍 Parsed user object:', JSON.stringify(userObj, null, 2));
          data[key] = userObj;
        } catch (userParseError) {
          console.error('❌ Failed to parse user data from initData:', userParseError);
          console.error('❌ Raw user value was:', value);
          return null;
        }
      } else {
        data[key] = decodeURIComponent(value);
      }
    });
    
    // Enhanced validation with detailed logging
    if (data.user) {
      console.log('🔍 User data found in initData:', JSON.stringify(data.user, null, 2));
      console.log('🔍 User ID type check:', typeof data.user.id, 'value:', data.user.id);
      
      if (data.user.id && (typeof data.user.id === 'number' || typeof data.user.id === 'string')) {
        // Convert string ID to number if needed
        const userId = typeof data.user.id === 'string' ? parseInt(data.user.id) : data.user.id;
        if (!isNaN(userId)) {
          data.user.id = userId;
          console.log('✅ Valid Telegram initData parsed with user ID:', userId);
          return data as TelegramInitData;
        }
      }
    }
    
    console.warn('⚠️ Parsed initData but missing valid user ID');
    console.warn('⚠️ Data structure:', JSON.stringify(data, null, 2));
    return null;
  } catch (error) {
    console.error('❌ Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string, botToken?: string): boolean {
  console.log('🔍 Enhanced Telegram initData validation starting...');
  
  if (!initData || initData.length === 0) {
    console.warn('❌ Missing or empty initData in validation');
    return false;
  }
  
  try {
    const parsed = parseTelegramInitData(initData);
    const isValid = !!parsed && !!parsed.user && (typeof parsed.user.id === 'number' || !isNaN(parseInt(parsed.user.id as any)));
    console.log('🔍 Validation result:', isValid);
    if (isValid) {
      console.log('✅ Valid initData with user ID:', parsed!.user!.id);
    }
    return isValid;
  } catch (error) {
    console.error('❌ Failed to validate Telegram initData:', error);
    return false;
  }
}

export function isTelegramWebApp(): boolean {
  const hasWindow = typeof window !== 'undefined';
  const hasTelegram = hasWindow && !!window.Telegram;
  const hasWebApp = hasTelegram && !!window.Telegram.WebApp;
  const hasUserAgent = hasWindow && navigator.userAgent.includes('Telegram');
  
  // Enhanced detection including user agent check
  const isWebApp = hasWebApp || hasUserAgent;
  
  console.log('🔍 Enhanced Telegram WebApp detection:', {
    hasWindow,
    hasTelegram,
    hasWebApp,
    hasUserAgent,
    userAgent: hasWindow ? navigator.userAgent : 'N/A',
    result: isWebApp
  });
  
  return isWebApp;
}

// Re-export the types for backward compatibility
export type { TelegramInitData } from '@/types/telegram';
