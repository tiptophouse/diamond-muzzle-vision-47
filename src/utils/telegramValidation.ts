
import { TelegramInitData } from '@/types/telegram';
import crypto from 'crypto-js';

// Simple in-memory cache for replay protection
const usedInitDataHashes = new Set<string>();
const HASH_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_INITDATA_AGE = 60 * 1000; // 60 seconds

// Clean up old hashes periodically
setInterval(() => {
  usedInitDataHashes.clear();
  console.log('🧹 Cleared initData hash cache for replay protection');
}, HASH_CLEANUP_INTERVAL);

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
    
    // Enhanced validation with timestamp check
    if (data.user && data.user.id && typeof data.user.id === 'number' && data.auth_date) {
      const authDate = parseInt(data.auth_date) * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // Check if initData is too old
      if (now - authDate > MAX_INITDATA_AGE) {
        console.warn(`⚠️ InitData too old: ${(now - authDate) / 1000}s ago (max: ${MAX_INITDATA_AGE / 1000}s)`);
        return null;
      }
      
      console.log('✅ Valid Telegram initData parsed with user ID:', data.user.id);
      return data as TelegramInitData;
    } else {
      console.warn('⚠️ Parsed initData but missing valid user ID or auth_date');
      return null;
    }
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string, botToken?: string): boolean {
  console.log('🔐 Enhanced Telegram initData validation with security checks');
  
  if (!initData || initData.length === 0) {
    console.warn('Missing or empty initData');
    return false;
  }

  try {
    // Generate hash for replay protection
    const initDataHash = crypto.SHA256(initData).toString();
    
    // Check for replay attack
    if (usedInitDataHashes.has(initDataHash)) {
      console.warn('🚫 Replay attack detected - initData already used');
      return false;
    }

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

    // Validate timestamp
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const age = now - authDateTime;
    
    if (age > MAX_INITDATA_AGE) {
      console.warn(`⚠️ InitData expired: ${age / 1000}s old (max: ${MAX_INITDATA_AGE / 1000}s)`);
      return false;
    }

    if (age < 0) {
      console.warn('⚠️ InitData from future - potential clock skew or tampering');
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
    
    let signatureValid = true;
    
    if (botToken && process.env.NODE_ENV === 'production') {
      // Validate HMAC signature in production
      const secretKey = crypto.HmacSHA256(botToken, 'WebAppData');
      const calculatedHash = crypto.HmacSHA256(dataCheckString, secretKey).toString();
      signatureValid = calculatedHash === hash;
      
      if (!signatureValid) {
        console.warn('Invalid Telegram signature');
        return false;
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode - skipping HMAC signature validation');
    }
    
    // Parse and validate user data
    const parsed = parseTelegramInitData(initData);
    const isValid = !!parsed && !!parsed.user && typeof parsed.user.id === 'number';
    
    if (isValid && signatureValid) {
      // Add to used hashes for replay protection
      usedInitDataHashes.add(initDataHash);
      console.log('✅ Enhanced validation successful - initData accepted');
      
      // Log authentication event for monitoring
      console.log('📊 Auth Event:', {
        userId: parsed?.user?.id,
        timestamp: new Date().toISOString(),
        age: `${age / 1000}s`,
        userAgent: navigator.userAgent.substring(0, 50)
      });
    }
    
    return isValid && signatureValid;
  } catch (error) {
    console.error('❌ Failed to validate Telegram initData:', error);
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

// Security monitoring helper
export function getAuthenticationMetrics() {
  return {
    cachedHashes: usedInitDataHashes.size,
    maxAge: MAX_INITDATA_AGE / 1000,
    cleanupInterval: HASH_CLEANUP_INTERVAL / 1000 / 60
  };
}

// Re-export the types for backward compatibility
export type { TelegramInitData } from '@/types/telegram';
