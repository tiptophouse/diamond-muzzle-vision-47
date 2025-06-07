
// Updated to point to your actual FastAPI backend
export const API_BASE_URL = "https://mazalbot.app/api/v1";

let currentUserId: number | null = 2138564172; // Force set for testing

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API: Current user ID set to:', userId, 'type:', typeof userId);
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API: Getting current user ID:', currentUserId);
  return currentUserId;
}
