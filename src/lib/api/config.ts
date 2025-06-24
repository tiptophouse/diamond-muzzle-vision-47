
// FastAPI backend configuration with JWT authentication
export const API_BASE_URL = "https://api.mazalbot.com";

// Use the correct JWT Bearer token from your environment
export const BACKEND_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo";

// Current user ID from Telegram InitData verification
let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API: Setting current user ID from Telegram InitData:', userId, 'type:', typeof userId);
  console.log('🔧 API: This user will be used for all FastAPI requests with proper isolation');
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API: Getting current user ID from Telegram verification:', currentUserId);
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
  console.log('🔧 API: Building FastAPI URL for authenticated user:', fullUrl);
  return fullUrl;
}

// Local storage helper for fallback (user-specific)
export function getLocalStorageKey(key: string): string {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
}
