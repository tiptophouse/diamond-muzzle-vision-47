
import { authService } from '@/services/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.mazalbot.com";

export async function http<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Use the authenticated fetch from authService which includes JWT
    const response = await authService.authenticatedFetch(endpoint, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('🔴 HTTP Request failed:', endpoint, error);
    throw error;
  }
}

// Helper function for non-authenticated requests (if needed)
export async function httpPublic<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
