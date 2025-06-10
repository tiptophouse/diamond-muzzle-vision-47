
// Secure API configuration - no hardcoded secrets
export const API_BASE_URL = "https://api.mazalbot.com";

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

// Remove hardcoded access token - use secure token retrieval instead
export async function getSecureAccessToken(): Promise<string | null> {
  try {
    // Use Supabase edge function to securely retrieve API token
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('get-api-token');
    
    if (error) {
      console.error('❌ Failed to get secure API token:', error);
      return null;
    }
    
    return data?.token || null;
  } catch (error) {
    console.error('❌ Error retrieving secure token:', error);
    return null;
  }
}

// Add a function to test the exact endpoint format
export function getFullApiUrl(endpoint: string): string {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔧 API: Full URL constructed:', fullUrl);
  return fullUrl;
}

// Environment validation
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = ['API_BASE_URL'];
  const missingVars: string[] = [];
  
  if (!API_BASE_URL) {
    missingVars.push('API_BASE_URL');
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}
