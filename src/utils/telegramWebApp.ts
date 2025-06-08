
import crypto from 'crypto-js';

interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  receiver?: TelegramWebAppUser;
  chat?: any;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export function isTelegramWebAppEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         !!window.Telegram?.WebApp && 
         typeof window.Telegram.WebApp === 'object';
}

export function getTelegramWebApp() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return null;
  }
  return window.Telegram.WebApp;
}

export function parseTelegramInitData(initDataRaw: string): TelegramWebAppInitData | null {
  try {
    if (!initDataRaw || initDataRaw.length === 0) {
      console.warn('📱 Empty initData provided');
      return null;
    }

    const urlParams = new URLSearchParams(initDataRaw);
    const data: any = {};
    
    // Parse each parameter
    urlParams.forEach((value, key) => {
      if (key === 'user' || key === 'receiver' || key === 'chat') {
        try {
          data[key] = JSON.parse(decodeURIComponent(value));
        } catch (parseError) {
          console.error(`📱 Failed to parse ${key}:`, parseError);
          return null;
        }
      } else if (key === 'auth_date' || key === 'can_send_after') {
        data[key] = parseInt(value, 10);
      } else {
        data[key] = decodeURIComponent(value);
      }
    });

    // Validate required fields
    if (!data.hash || !data.auth_date) {
      console.warn('📱 Missing required fields in initData');
      return null;
    }

    return data as TelegramWebAppInitData;
  } catch (error) {
    console.error('📱 Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(
  initDataRaw: string, 
  botToken?: string
): boolean {
  try {
    if (!initDataRaw || initDataRaw.length === 0) {
      console.warn('📱 Empty initData for validation');
      return false;
    }

    // In development, we can skip HMAC validation if no bot token is provided
    if (process.env.NODE_ENV === 'development' && !botToken) {
      console.log('📱 Development mode - skipping HMAC validation');
      const parsed = parseTelegramInitData(initDataRaw);
      return !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
    }

    const urlParams = new URLSearchParams(initDataRaw);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.warn('📱 Missing hash in initData');
      return false;
    }

    // Remove hash from params for validation
    urlParams.delete('hash');
    
    // Create data check string according to Telegram specs
    const dataCheckArr: string[] = [];
    urlParams.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    if (botToken) {
      // Create secret key using bot token
      const secretKey = crypto.HmacSHA256(botToken, 'WebAppData');
      const calculatedHash = crypto.HmacSHA256(dataCheckString, secretKey).toString();
      
      if (calculatedHash !== hash) {
        console.warn('📱 Invalid HMAC signature');
        return false;
      }
    }

    // Check if auth_date is recent (within 24 hours)
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours
    
    if (now - authDate > maxAge) {
      console.warn('📱 InitData is too old');
      return false;
    }

    const parsed = parseTelegramInitData(initDataRaw);
    return !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
  } catch (error) {
    console.error('📱 Validation error:', error);
    return false;
  }
}

export function initializeTelegramWebApp(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;
    
    const checkTelegram = () => {
      attempts++;
      
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        try {
          // Initialize WebApp
          if (typeof tg.ready === 'function') {
            tg.ready();
            console.log('📱 Telegram WebApp ready() called');
          }
          
          if (typeof tg.expand === 'function') {
            tg.expand();
            console.log('📱 Telegram WebApp expand() called');
          }
          
          // Apply theme color to document if available
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
            console.log('📱 Telegram WebApp theme applied');
          }
          
          console.log('📱 Telegram WebApp initialized successfully');
          console.log('📱 InitData length:', tg.initData?.length || 0);
          console.log('📱 User from initDataUnsafe:', tg.initDataUnsafe?.user);
          
          resolve(true);
        } catch (error) {
          console.error('📱 Failed to initialize Telegram WebApp:', error);
          resolve(false);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(checkTelegram, 100);
      } else {
        console.warn('📱 Telegram WebApp not available after maximum attempts');
        resolve(false);
      }
    };
    
    checkTelegram();
  });
}
