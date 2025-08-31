
import { getBackendAuthToken } from "@/lib/api/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.mazalbot.com";

export async function http<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getBackendAuthToken();
  
  if (!token) {
    console.error('❌ No JWT token available for API call:', endpoint);
    throw new Error('Not authenticated - JWT token required');
  }
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  console.log('🔑 Making authenticated API call:', endpoint, 'with JWT token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API call failed:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
