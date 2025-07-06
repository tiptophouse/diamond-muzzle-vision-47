
// Enhanced Telegram validation utilities
export interface AuthenticationMetrics {
  attemptTimestamp: number;
  environment: string;
  hasInitData: boolean;
  initDataLength: number;
  validationStatus: 'pending' | 'success' | 'failed';
}

let authMetrics: AuthenticationMetrics = {
  attemptTimestamp: Date.now(),
  environment: typeof window !== 'undefined' ? 'browser' : 'server',
  hasInitData: false,
  initDataLength: 0,
  validationStatus: 'pending'
};

export function getAuthenticationMetrics(): AuthenticationMetrics {
  return { ...authMetrics };
}

export function updateAuthenticationMetrics(updates: Partial<AuthenticationMetrics>): void {
  authMetrics = { ...authMetrics, ...updates };
}

export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.Telegram?.WebApp && 
    typeof window.Telegram.WebApp === 'object' &&
    window.Telegram.WebApp.initData !== undefined
  );
}

export function parseTelegramInitData(initData: string) {
  try {
    updateAuthenticationMetrics({
      hasInitData: !!initData,
      initDataLength: initData?.length || 0
    });

    if (!initData) {
      updateAuthenticationMetrics({ validationStatus: 'failed' });
      return null;
    }

    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      updateAuthenticationMetrics({ validationStatus: 'failed' });
      return null;
    }
    
    const user = JSON.parse(decodeURIComponent(userParam));
    
    updateAuthenticationMetrics({ validationStatus: 'success' });
    
    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
        photo_url: user.photo_url
      },
      auth_date: parseInt(urlParams.get('auth_date') || '0'),
      hash: urlParams.get('hash')
    };
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);
    updateAuthenticationMetrics({ validationStatus: 'failed' });
    return null;
  }
}

export function validateTelegramData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!authDate || !hash) {
      return false;
    }
    
    // Check timestamp validity (within 5 minutes as per Telegram recommendation)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    const isTimestampValid = (now - authDateTime) <= maxAge;
    
    if (!isTimestampValid) {
      console.warn('🔐 Telegram initData timestamp expired');
      return false;
    }
    
    // Note: Full HMAC-SHA256 validation is now done server-side
    // This client-side check only validates basic structure and timestamp
    console.log('✅ Basic Telegram initData validation passed (full validation on server)');
    return true;
    
  } catch (error) {
    console.error('Telegram data validation failed:', error);
    return false;
  }
}

// Export interface for use in other modules
export interface TelegramInitData {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  auth_date: number;
  hash: string | null;
}

// Add the missing function that other files expect
export const validateTelegramInitData = validateTelegramData;
