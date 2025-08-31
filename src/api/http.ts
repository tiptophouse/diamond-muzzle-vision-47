// src/api/http.ts
import { getBackendAuthToken } from "@/lib/api/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.mazalbot.com";

export async function http<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getBackendAuthToken();
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
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