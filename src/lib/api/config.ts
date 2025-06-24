
// FastAPI backend configuration
export const API_BASE_URL = "https://api.mazalbot.com"; // Your FastAPI backend URL

// Use the correct backend access token for FastAPI authentication
export const BACKEND_ACCESS_TOKEN = "ifj9ov1rh20fslfp";

// Set admin user ID directly
const ADMIN_USER_ID = 2138564172;
let currentUserId: number | null = ADMIN_USER_ID;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API: Current user ID set to:', userId, 'type:', typeof userId);
  console.log('🔧 API: This will be used for FastAPI requests');
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API: Getting current user ID:', currentUserId);
  return currentUserId;
}

// Helper function to check if we're in development
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('lovableproject.com');
}

// FastAPI connection helper
export function getApiUrl(endpoint: string): string {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔧 API: Building FastAPI URL:', fullUrl);
  return fullUrl;
}

// Local storage helper for fallback
export function getLocalStorageKey(key: string): string {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
}
