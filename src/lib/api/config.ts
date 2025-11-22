// ⚠️ CRITICAL: Update this to your actual FastAPI backend URL
// Current URL returns 404 - replace with your deployed backend URL
// Examples: Railway: https://your-app.railway.app
//           Render: https://your-app.onrender.com
//           Heroku: https://your-app.herokuapp.com
export const API_BASE_URL = "https://api.mazalbot.com"; // ❌ RETURNING 404 - UPDATE THIS!

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
         window.location.hostname.includes('lovableproject.com');
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
