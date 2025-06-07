
// Updated to point to your actual FastAPI backend
export const API_BASE_URL = "https://api.mazalbot.com";

let currentUserId: number | null = 2138564172; // Force set for testing

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

// Your backend access token
export const BACKEND_ACCESS_TOKEN = "ifj9ov1rh20fslfp";
