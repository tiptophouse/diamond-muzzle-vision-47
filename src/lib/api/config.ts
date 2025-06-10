
// Updated to use Supabase secrets for all configuration
export const API_BASE_URL = "https://api.mazalbot.com";

// Remove hardcoded values - these will come from Supabase secrets
let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API: Current user ID set to:', userId, 'type:', typeof userId);
}

export function getCurrentUserId(): number | null {
  return currentUserId;
}

// Helper function to check if we're in development
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('lovableproject.com');
}

// Configuration will be loaded from Supabase secrets via edge functions
export function getFullApiUrl(endpoint: string): string {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔧 API: Full URL constructed:', fullUrl);
  return fullUrl;
}
