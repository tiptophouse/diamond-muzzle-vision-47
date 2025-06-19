
// Updated to point to your actual FastAPI backend
export const API_BASE_URL = "https://mazalbot.com";

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

// Add health check function
export async function testApiConnection(): Promise<boolean> {
  try {
    const healthUrl = `${API_BASE_URL}/api/v1/alive`;
    console.log('🔍 API: Testing FastAPI connection to:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'application/json' }
    });
    
    const isHealthy = response.ok;
    console.log(isHealthy ? '✅ API: FastAPI is healthy' : '❌ API: FastAPI health check failed');
    return isHealthy;
  } catch (error) {
    console.error('❌ API: FastAPI connection test failed:', error);
    return false;
  }
}
