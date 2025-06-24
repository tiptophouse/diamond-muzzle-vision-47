
// FastAPI backend configuration with JWT authentication
export const API_BASE_URL = "https://api.mazalbot.com";

// Use the correct JWT Bearer token from your environment
export const BACKEND_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo";

// Current user ID from Telegram InitData verification
let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API CONFIG: Setting current Telegram user ID for data isolation:', userId);
  console.log('🔧 API CONFIG: All API requests will be filtered by this Telegram ID');
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API CONFIG: Getting current Telegram user ID for request filtering:', currentUserId);
  return currentUserId;
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
