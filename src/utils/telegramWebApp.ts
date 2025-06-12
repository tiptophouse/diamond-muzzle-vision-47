
import { TelegramUser, TelegramInitData, TelegramWebApp } from '@/types/telegram';

// Check if we're in a Telegram WebApp environment
export function isTelegramWebAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // More comprehensive check
  return !!(
    window.Telegram?.WebApp && 
    typeof window.Telegram.WebApp === 'object' &&
    (
      window.Telegram.WebApp.initData ||
      window.Telegram.WebApp.initDataUnsafe ||
      window.location.search.includes('tgWebAppData') ||
      window.location.hash.includes('tgWebAppData') ||
      navigator.userAgent.includes('TelegramBot')
    )
  );
}

// Get the Telegram WebApp instance
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

// Initialize Telegram WebApp
export async function initializeTelegramWebApp(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;
    
    const checkAndInit = () => {
      attempts++;
      
      if (window.Telegram?.WebApp) {
        try {
          const tg = window.Telegram.WebApp;
          
          console.log('🔧 Initializing Telegram WebApp...');
          console.log('📱 WebApp version:', tg.version);
          console.log('🔍 Has initData:', !!tg.initData);
          console.log('🔍 Has initDataUnsafe:', !!tg.initDataUnsafe);
          
          // Call ready first
          if (typeof tg.ready === 'function') {
            tg.ready();
            console.log('✅ WebApp ready() called');
          }
          
          // Expand the app
          if (typeof tg.expand === 'function') {
            tg.expand();
            console.log('✅ WebApp expand() called');
          }
          
          // Set theme
          try {
            if (tg.themeParams?.bg_color) {
              document.body.style.backgroundColor = tg.themeParams.bg_color;
            }
            
            // Safely try to set header color
            if (typeof tg.setHeaderColor === 'function') {
              tg.setHeaderColor('#1f2937');
              console.log('✅ Header color set');
            } else {
              console.log('ℹ️ setHeaderColor method not available');
            }
          } catch (themeError) {
            console.warn('⚠️ Theme setup failed:', themeError);
          }
          
          console.log('✅ Telegram WebApp initialized successfully');
          resolve(true);
          return;
        } catch (error) {
          console.error('❌ Failed to initialize Telegram WebApp:', error);
          resolve(false);
          return;
        }
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkAndInit, 100);
      } else {
        console.warn('⚠️ Telegram WebApp not available after', maxAttempts, 'attempts');
        resolve(false);
      }
    };
    
    checkAndInit();
  });
}

// Parse Telegram initData
export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!userParam || !authDate || !hash) {
      console.warn('⚠️ Missing required initData parameters');
      return null;
    }
    
    const user: TelegramUser = JSON.parse(decodeURIComponent(userParam));
    
    return {
      user,
      auth_date: parseInt(authDate),
      hash,
      query_id: urlParams.get('query_id') || undefined
    };
  } catch (error) {
    console.error('❌ Failed to parse initData:', error);
    return null;
  }
}

// Validate Telegram initData (simplified for client-side)
export function validateTelegramInitData(initData: string): boolean {
  try {
    // Basic validation - check if required fields exist
    const urlParams = new URLSearchParams(initData);
    const user = urlParams.get('user');
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!user || !authDate || !hash) {
      console.warn('⚠️ InitData validation failed - missing required fields');
      return false;
    }
    
    // Check if auth_date is not too old (24 hours)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (now - authDateTime > maxAge) {
      console.warn('⚠️ InitData validation failed - auth_date is too old');
      return false;
    }
    
    // Try to parse user data
    const userData = JSON.parse(decodeURIComponent(user));
    if (!userData.id || !userData.first_name) {
      console.warn('⚠️ InitData validation failed - invalid user data');
      return false;
    }
    
    console.log('✅ InitData validation passed (client-side)');
    return true;
  } catch (error) {
    console.error('❌ InitData validation error:', error);
    return false;
  }
}
