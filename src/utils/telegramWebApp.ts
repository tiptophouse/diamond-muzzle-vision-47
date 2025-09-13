
import { telegramSDK } from '@/lib/telegram/telegramSDK';

// Re-export the interface from the SDK for backward compatibility
export type { TelegramWebAppInterface as TelegramWebApp, TelegramUser } from '@/lib/telegram/telegramSDK';

export function isTelegramWebAppEnvironment(): boolean {
  return telegramSDK.isTelegramWebAppEnvironment();
}

export function getTelegramWebApp() {
  return telegramSDK.getWebApp();
}

export function parseTelegramInitData(initData: string) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return null;
    }
    
    const user = JSON.parse(decodeURIComponent(userParam));
    
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
      auth_date: urlParams.get('auth_date'),
      hash: urlParams.get('hash')
    };
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!authDate || !hash) {
      return false;
    }
    
    // Check if the data is not too old (within 1 minute)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 60 * 1000; // 1 minute
    
    return (now - authDateTime) <= maxAge;
  } catch (error) {
    console.error('Failed to validate Telegram initData:', error);
    return false;
  }
}

export function initializeTelegramWebApp(): Promise<boolean> {
  return telegramSDK.initialize();
}
