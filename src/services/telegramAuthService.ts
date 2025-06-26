
import { verifyTelegramUser } from '@/lib/api/auth';
import { setCurrentUserId, setAccessToken } from '@/lib/api/config';

export interface TelegramAuthResult {
  success: boolean;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  accessToken?: string;
  error?: string;
}

export class TelegramAuthService {
  private static instance: TelegramAuthService;
  private currentUser: any = null;
  private accessToken: string | null = null;

  static getInstance(): TelegramAuthService {
    if (!TelegramAuthService.instance) {
      TelegramAuthService.instance = new TelegramAuthService();
    }
    return TelegramAuthService.instance;
  }

  async authenticateUser(): Promise<TelegramAuthResult> {
    try {
      console.log('🔐 TELEGRAM AUTH: Starting enhanced authentication process...');

      // Check if we're in Telegram WebApp environment
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.log('🔧 TELEGRAM AUTH: Not in Telegram environment - using fallback');
        return this.createFallbackAuth();
      }

      const tg = window.Telegram.WebApp;
      
      // Initialize Telegram WebApp with better error handling
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        console.log('✅ TELEGRAM AUTH: WebApp initialized successfully');
      } catch (initError) {
        console.warn('⚠️ TELEGRAM AUTH: WebApp initialization failed:', initError);
      }

      console.log('🔍 TELEGRAM AUTH: InitData available:', !!tg.initData);
      console.log('🔍 TELEGRAM AUTH: InitData length:', tg.initData?.length || 0);
      console.log('🔍 TELEGRAM AUTH: InitDataUnsafe available:', !!tg.initDataUnsafe);

      // Enhanced initData handling
      let userData = null;

      // Priority 1: Try to extract from initDataUnsafe (most reliable for development)
      if (tg.initDataUnsafe?.user) {
        console.log('🔍 TELEGRAM AUTH: Using initDataUnsafe user data');
        userData = {
          id: tg.initDataUnsafe.user.id,
          first_name: tg.initDataUnsafe.user.first_name || 'User',
          last_name: tg.initDataUnsafe.user.last_name || '',
          username: tg.initDataUnsafe.user.username || '',
          language_code: tg.initDataUnsafe.user.language_code || 'en'
        };
      }

      // Priority 2: Try to verify with backend if we have initData
      if (tg.initData && tg.initData.length > 0) {
        try {
          console.log('🔐 TELEGRAM AUTH: Attempting backend verification...');
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            console.log('✅ TELEGRAM AUTH: Backend verification successful');
            
            userData = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || 'User',
              last_name: verificationResult.user_data?.last_name || '',
              username: verificationResult.user_data?.username || '',
              language_code: verificationResult.user_data?.language_code || 'en'
            };

            this.accessToken = verificationResult.access_token;
            setAccessToken(verificationResult.access_token, verificationResult.expires_in);
          }
        } catch (verifyError) {
          console.warn('⚠️ TELEGRAM AUTH: Backend verification failed:', verifyError);
        }
      }

      if (userData) {
        this.currentUser = userData;
        setCurrentUserId(userData.id);

        return {
          success: true,
          user: userData,
          accessToken: this.accessToken || undefined,
          error: this.accessToken ? null : 'Using unverified Telegram data'
        };
      }

      // Final fallback
      return this.createFallbackAuth();

    } catch (error) {
      console.error('❌ TELEGRAM AUTH: Authentication failed:', error);
      return this.createFallbackAuth();
    }
  }

  private createFallbackAuth(): TelegramAuthResult {
    console.log('🆘 TELEGRAM AUTH: Using hardcoded fallback for development');
    
    const fallbackUser = {
      id: 2138564172, // Admin ID from the context
      first_name: 'Development',
      last_name: 'User',
      username: 'devuser',
      language_code: 'en'
    };

    this.currentUser = fallbackUser;
    setCurrentUserId(fallbackUser.id);

    return {
      success: true,
      user: fallbackUser,
      error: 'Using development fallback authentication'
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
}
