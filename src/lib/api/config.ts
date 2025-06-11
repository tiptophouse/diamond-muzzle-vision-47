
// Configuration for different environments
function getApiBaseUrl(): string {
  // Check if we're in development mode
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('lovableproject.com') ||
                window.location.hostname === '127.0.0.1';
  
  if (isDev) {
    // For local development, try to connect to local backend first
    return 'http://localhost:8000';
  } else {
    // For production, use the external API
    return 'https://api.mazalbot.com';
  }
}

export const API_BASE_URL = getApiBaseUrl();

let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API: Current user ID set to:', userId, 'type:', typeof userId);
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API: Getting current user ID:', currentUserId);
  return currentUserId;
}

// Helper function to check if we're in development
export function isDevelopment(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('lovableproject.com') ||
         window.location.hostname === '127.0.0.1';
}

// Your backend access token
export const BACKEND_ACCESS_TOKEN = "ifj9ov1rh20fslfp";

// Add a function to test the exact endpoint format
export function getFullApiUrl(endpoint: string): string {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔧 API: Full URL constructed:', fullUrl);
  return fullUrl;
}

// Add fallback configuration for when local backend is not available
export function getFallbackApiUrl(): string {
  return 'https://api.mazalbot.com';
}
