
// FastAPI backend configuration with dynamic JWT authentication
export const API_BASE_URL = "https://api.mazalbot.com";

// Current user ID from Telegram InitData verification
let currentUserId: number | null = null;

// Dynamic token storage
let currentAccessToken: string | null = null;
let tokenExpiry: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API CONFIG: Setting current Telegram user ID for data isolation:', userId);
  console.log('🔧 API CONFIG: All API requests will be filtered by this Telegram ID');
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API CONFIG: Getting current Telegram user ID for request filtering:', currentUserId);
  return currentUserId;
}

export function setAccessToken(token: string, expiresIn?: number) {
  currentAccessToken = token;
  tokenExpiry = expiresIn ? Date.now() + (expiresIn * 1000) : null;
  console.log('🔧 API CONFIG: Setting access token with expiry:', tokenExpiry ? new Date(tokenExpiry) : 'no expiry');
}

export function getAccessToken(): string | null {
  if (!currentAccessToken) {
    console.warn('⚠️ API CONFIG: No access token available');
    return null;
  }
  
  if (tokenExpiry && Date.now() > tokenExpiry) {
    console.warn('⚠️ API CONFIG: Access token expired, clearing...');
    currentAccessToken = null;
    tokenExpiry = null;
    return null;
  }
  
  return currentAccessToken;
}

export function clearAccessToken() {
  currentAccessToken = null;
  tokenExpiry = null;
  console.log('🧹 API CONFIG: Cleared access token');
}

// Helper function to check if we're in development
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('lovableproject.com');
}

// FastAPI connection helper with Telegram user ID
export function getApiUrl(endpoint: string): string {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔧 API CONFIG: Building FastAPI URL with Telegram user isolation:', fullUrl);
  console.log('🔧 API CONFIG: Request will be authenticated with Telegram user ID:', getCurrentUserId());
  return fullUrl;
}

// Local storage helper for fallback (user-specific)
export function getLocalStorageKey(key: string): string {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
}

// Helper to get Telegram user headers for API requests
export function getTelegramUserHeaders(): Record<string, string> {
  const telegramUserId = getCurrentUserId();
  const headers: Record<string, string> = {};
  
  if (telegramUserId) {
    headers['X-Telegram-User-ID'] = telegramUserId.toString();
    console.log('🔧 API CONFIG: Adding Telegram user ID header for data isolation:', telegramUserId);
  } else {
    console.warn('⚠️ API CONFIG: No Telegram user ID available for request filtering');
  }
  
  return headers;
}
