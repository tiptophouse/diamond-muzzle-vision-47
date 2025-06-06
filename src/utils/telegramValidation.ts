
import { TelegramInitData } from '@/types/telegram';

export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    if (!initData || initData.length === 0) {
      console.warn('❌ Empty initData provided');
      return null;
    }
    
    console.log('🔍 Parsing initData:', initData.substring(0, 100) + '...');
    
    const urlParams = new URLSearchParams(initData);
    const data: any = {};
    
    urlParams.forEach((value, key) => {
      if (key === 'user') {
        try {
          const decodedValue = decodeURIComponent(value);
          const parsedUser = JSON.parse(decodedValue);
          data[key] = parsedUser;
          console.log('✅ Successfully parsed user data:', {
            id: parsedUser.id,
            first_name: parsedUser.first_name,
            username: parsedUser.username
          });
        } catch (userParseError) {
          console.error('❌ Failed to parse user data:', userParseError);
          return null;
        }
      } else {
        data[key] = decodeURIComponent(value);
      }
    });
    
    // Enhanced validation with logging
    if (data.user && data.user.id && typeof data.user.id === 'number') {
      console.log('✅ Valid Telegram initData parsed:', {
        userId: data.user.id,
        userName: data.user.first_name,
        hasAuthDate: !!data.auth_date,
        hasHash: !!data.hash
      });
      return data as TelegramInitData;
    } else {
      console.warn('❌ Invalid user data in initData:', {
        hasUser: !!data.user,
        userId: data.user?.id,
        userIdType: typeof data.user?.id
      });
      return null;
    }
  } catch (error) {
    console.error('💥 Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string, botToken?: string): boolean {
  console.log('🔍 Validating Telegram initData...');
  
  if (!initData || initData.length === 0) {
    console.warn('❌ Missing or empty initData');
    return false;
  }
  
  try {
    const parsed = parseTelegramInitData(initData);
    const isValid = !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
    
    console.log('✅ Validation result:', {
      isValid,
      userId: parsed?.user?.id,
      userName: parsed?.user?.first_name
    });
    
    return isValid;
  } catch (error) {
    console.error('💥 Failed to validate Telegram initData:', error);
    return false;
  }
}

export function isTelegramWebApp(): boolean {
  const hasWindow = typeof window !== 'undefined';
  const hasTelegram = hasWindow && !!window.Telegram;
  const hasWebApp = hasTelegram && !!window.Telegram?.WebApp;
  const isWebApp = hasWebApp && typeof window.Telegram.WebApp === 'object';
  
  console.log('🔍 Telegram WebApp detection:', {
    hasWindow,
    hasTelegram,
    hasWebApp,
    isWebApp,
    platform: window.Telegram?.WebApp?.platform,
    version: window.Telegram?.WebApp?.version
  });
  
  return isWebApp;
}

// Re-export the types for backward compatibility
export type { TelegramInitData } from '@/types/telegram';
