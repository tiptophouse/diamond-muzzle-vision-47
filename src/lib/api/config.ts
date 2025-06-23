
// FastAPI backend configuration
export const API_BASE_URL = "https://api.mazalbot.com"; // Your FastAPI backend URL

// Use the provided backend access token directly
export const BACKEND_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo";

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
