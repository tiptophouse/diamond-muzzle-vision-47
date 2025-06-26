
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
      console.log('🔐 TELEGRAM AUTH: Starting authentication process...');

      // Check if we're in Telegram WebApp environment
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.log('🔧 TELEGRAM AUTH: Not in Telegram environment - using fallback');
        return this.createFallbackAuth();
      }

      const tg = window.Telegram.WebApp;
      
      // Initialize Telegram WebApp
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();

      console.log('🔍 TELEGRAM AUTH: InitData available:', !!tg.initData);
      console.log('🔍 TELEGRAM AUTH: InitData length:', tg.initData?.length || 0);

      // Try to use real initData first
      if (tg.initData && tg.initData.length > 0) {
        console.log('🔐 TELEGRAM AUTH: Verifying initData with backend...');
        
        const verificationResult = await verifyTelegramUser(tg.initData);
        
        if (verificationResult && verificationResult.success) {
          console.log('✅ TELEGRAM AUTH: Backend verification successful');
          
          const user = {
            id: verificationResult.user_id,
            first_name: verificationResult.user_data?.first_name || 'User',
            last_name: verificationResult.user_data?.last_name || '',
            username: verificationResult.user_data?.username || '',
            language_code: verificationResult.user_data?.language_code || 'en'
          };

          this.currentUser = user;
          this.accessToken = verificationResult.access_token;
          
          setCurrentUserId(user.id);
          setAccessToken(verificationResult.access_token, verificationResult.expires_in);

          return {
            success: true,
            user,
            accessToken: verificationResult.access_token
          };
        }
      }

      // Fallback to initDataUnsafe
      if (tg.initDataUnsafe?.user) {
        console.log('⚠️ TELEGRAM AUTH: Using initDataUnsafe as fallback');
        
        const unsafeUser = tg.initDataUnsafe.user;
        const user = {
          id: unsafeUser.id,
          first_name: unsafeUser.first_name || 'User',
          last_name: unsafeUser.last_name || '',
          username: unsafeUser.username || '',
          language_code: unsafeUser.language_code || 'en'
        };

        this.currentUser = user;
        setCurrentUserId(user.id);

        return {
          success: true,
          user,
          error: 'Using unverified Telegram data'
        };
      }

      // Final fallback
      return this.createFallbackAuth();

    } catch (error) {
      console.error('❌ TELEGRAM AUTH: Authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  private createFallbackAuth(): TelegramAuthResult {
    console.log('🆘 TELEGRAM AUTH: Using hardcoded fallback for development');
    
    const fallbackUser = {
      id: 2138564172, // Your admin ID from the context
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
