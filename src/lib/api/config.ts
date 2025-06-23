
// FastAPI backend configuration
export const API_BASE_URL = "https://api.mazalbot.com";

let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API Config: Current user ID set to:', userId, 'type:', typeof userId);
  console.log('🔧 API Config: API calls will now include user_id=' + userId + ' parameter');
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API Config: Getting current user ID:', currentUserId);
  if (!currentUserId) {
    console.warn('⚠️ API Config: No user ID set! API calls may fail without user_id parameter');
  }
  return currentUserId;
}

// Helper function to check if we're in development
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('lovableproject.com');
}

// Local storage helper
export function getLocalStorageKey(key: string): string {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
}
