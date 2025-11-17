// API Configuration
export const API_BASE_URL = 'https://api.mazalbot.com';

// Development mode - allows testing without Telegram authentication
export function isDevelopmentMode(): boolean {
  // Enable dev mode if:
  // 1. Running in Lovable preview (lovableproject.com)
  // 2. Or explicitly set via URL param ?dev=true
  // 3. Or running on localhost
  const isLovablePreview = window.location.hostname.includes('lovableproject.com');
  const hasDevParam = new URLSearchParams(window.location.search).get('dev') === 'true';
  const isLocalhost = window.location.hostname === 'localhost';
  
  return isLovablePreview || hasDevParam || isLocalhost;
}

// Mock user for development/testing
export const DEV_MOCK_USER = {
  id: 2138564172, // Admin user ID from the logs
  first_name: 'Dev',
  last_name: 'User',
  username: 'devuser',
  language_code: 'en'
};

// Current user ID management
let currentUserId: number | null = null;

export function getCurrentUserId(): number | null {
  console.log('🔧 API: Getting current user ID:', currentUserId);
  return currentUserId;
}

export function setCurrentUserId(userId: number | null): void {
  console.log('🔧 API: Setting current user ID:', userId);
  currentUserId = userId;
}

// Helper function to check if we're in development (legacy support)
export function isDevelopment(): boolean {
  return isDevelopmentMode();
}

// Add a function to test the exact endpoint format
export function getFullApiUrl(endpoint: string): string {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔧 API: Full URL constructed:', fullUrl);
  return fullUrl;
}

// Validate API configuration on startup
console.log('🔧 API Config initialized:', {
  baseUrl: API_BASE_URL,
  environment: isDevelopment() ? 'development' : 'production'
});
