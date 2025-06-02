export interface TelegramUrlParams {
  tgWebAppData?: string;
  tgWebAppVersion?: string;
  tgWebAppPlatform?: string;
  tgWebAppThemeParams?: string;
}

export function parseTelegramUrl(): TelegramUrlParams {
  const url = new URL(window.location.href);
  const params: TelegramUrlParams = {};
  
  // Check URL search params
  if (url.searchParams.has('tgWebAppData')) {
    params.tgWebAppData = url.searchParams.get('tgWebAppData') || undefined;
  }
  if (url.searchParams.has('tgWebAppVersion')) {
    params.tgWebAppVersion = url.searchParams.get('tgWebAppVersion') || undefined;
  }
  if (url.searchParams.has('tgWebAppPlatform')) {
    params.tgWebAppPlatform = url.searchParams.get('tgWebAppPlatform') || undefined;
  }
  if (url.searchParams.has('tgWebAppThemeParams')) {
    params.tgWebAppThemeParams = url.searchParams.get('tgWebAppThemeParams') || undefined;
  }
  
  // Check hash params (after #)
  if (url.hash.includes('tgWebAppData=')) {
    const hashParams = new URLSearchParams(url.hash.substring(1));
    if (hashParams.has('tgWebAppData')) {
      params.tgWebAppData = hashParams.get('tgWebAppData') || undefined;
    }
  }
  
  return params;
}

export function cleanUrl(): string {
  const url = new URL(window.location.href);
  
  // Remove Telegram-specific params from search
  const cleanSearchParams = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (!key.startsWith('tgWebApp')) {
      cleanSearchParams.append(key, value);
    }
  });
  
  // Clean hash - keep only route part
  let cleanHash = url.hash;
  if (cleanHash.includes('tgWebAppData=') || cleanHash.includes('&')) {
    // Extract just the route part (everything before first & or ?)
    const hashParts = cleanHash.split(/[&?]/);
    cleanHash = hashParts[0] || '#/';
  }
  
  // Ensure we have a valid hash route
  if (!cleanHash || cleanHash === '#') {
    cleanHash = '#/';
  }
  
  const cleanSearch = cleanSearchParams.toString();
  return `${url.origin}${url.pathname}${cleanSearch ? '?' + cleanSearch : ''}${cleanHash}`;
}

export function handleTelegramRedirect(): void {
  const telegramParams = parseTelegramUrl();
  
  // If we have Telegram params, store them and clean the URL
  if (telegramParams.tgWebAppData) {
    console.log('📱 Storing Telegram parameters and cleaning URL');
    
    // Store Telegram data temporarily
    sessionStorage.setItem('telegram_webapp_data', JSON.stringify(telegramParams));
    
    // Clean the URL but preserve the intended route
    const cleanedUrl = cleanUrl();
    
    // Only replace if different to avoid infinite loops
    if (cleanedUrl !== window.location.href) {
      console.log('🧹 Redirecting to clean URL:', cleanedUrl);
      window.history.replaceState({}, '', cleanedUrl);
    }
  }
}

export function getTelegramDataFromStorage(): TelegramUrlParams | null {
  try {
    const stored = sessionStorage.getItem('telegram_webapp_data');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to retrieve Telegram data from storage:', error);
    return null;
  }
}

export function clearTelegramDataFromStorage(): void {
  sessionStorage.removeItem('telegram_webapp_data');
}

// Enhanced error recovery for URL issues
export function recoverFromUrlError(): void {
  console.log('🔄 Attempting URL error recovery');
  
  try {
    // First, try to clean the current URL
    const cleanedUrl = cleanUrl();
    
    // If URL is corrupted, fallback to root
    if (!cleanedUrl || cleanedUrl.includes('undefined')) {
      console.log('🚨 URL corrupted, redirecting to root');
      window.location.href = window.location.origin + '/#/';
      return;
    }
    
    // Apply the cleaned URL
    window.history.replaceState({}, '', cleanedUrl);
    
    // Force a reload if we're still having issues
    setTimeout(() => {
      if (window.location.href.includes('404') || window.location.href.includes('error')) {
        console.log('🔄 Final fallback: forcing reload');
        window.location.reload();
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ URL recovery failed, forcing reload:', error);
    window.location.href = window.location.origin + '/#/';
  }
}
