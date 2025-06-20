
// Local storage configuration - no external API dependency
export const API_BASE_URL = ""; // No external API needed

let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 Local Storage: Current user ID set to:', userId, 'type:', typeof userId);
}

export function getCurrentUserId(): number | null {
  console.log('🔧 Local Storage: Getting current user ID:', currentUserId);
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
