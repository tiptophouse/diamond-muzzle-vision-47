
import { toast } from "@/components/ui/use-toast";

// Updated to point to your actual FastAPI backend
const API_BASE_URL = "https://mazalbot.app/api/v1";

let currentUserId: number | null = 2138564172; // Force set for testing

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API: Current user ID set to:', userId, 'type:', typeof userId);
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API: Getting current user ID:', currentUserId);
  return currentUserId;
}

export const apiEndpoints = {
  getAllStones: (userId: number) => {
    const endpoint = `/get_all_stones?user_id=${userId}`;
    console.log('🔧 API: Building getAllStones endpoint:', endpoint, 'for user:', userId, 'type:', typeof userId);
    return endpoint;
  },
  verifyTelegram: () => `/verify-telegram`,
  uploadInventory: () => `/upload-inventory`,
  deleteDiamond: (diamondId: string, userId: number) => `/delete_diamond?diamond_id=${diamondId}&user_id=${userId}`,
  soldDiamond: () => `/sold`,
  createReport: () => `/create-report`,
  getReport: (reportId: string) => `/get-report?diamond_id=${reportId}`,
  getDashboardStats: (userId: number) => `/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/users/${userId}/inventory?page=${page}&limit=${limit}`,
};

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface TelegramVerificationResponse {
  success: boolean;
  user_id: number;
  user_data: any;
  message?: string;
}

// Store verification result
let verificationResult: TelegramVerificationResponse | null = null;

export function getVerificationResult(): TelegramVerificationResponse | null {
  return verificationResult;
}

// Verify Telegram user with backend
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Verifying Telegram user with backend');
    console.log('🔐 API: Sending to:', `${API_BASE_URL}${apiEndpoints.verifyTelegram()}`);
    console.log('🔐 API: InitData length:', initData.length);
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        init_data: initData
      }),
    });

    console.log('🔐 API: Verification response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Verification failed with status:', response.status, 'body:', errorText);
      throw new Error(`Verification failed: ${response.status} - ${errorText}`);
    }

    const result: TelegramVerificationResponse = await response.json();
    console.log('✅ API: Telegram verification successful:', result);
    
    verificationResult = result;
    if (result.success && result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('❌ API: Telegram verification failed:', error);
    return null;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API: Making request to:', url);
    console.log('🚀 API: Current user ID:', currentUserId, 'type:', typeof currentUserId);
    
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...options.headers as Record<string, string>,
    };
    
    // Add auth headers if available
    if (verificationResult && verificationResult.success) {
      const authToken = `telegram_verified_${verificationResult.user_id}`;
      headers["Authorization"] = `Bearer ${authToken}`;
      console.log('🚀 API: Added auth token to request');
    }
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
    };
    
    console.log('🚀 API: Fetch options:', fetchOptions);
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 API: Response status:', response.status);
    console.log('📡 API: Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response received, data type:', typeof data, 'length:', Array.isArray(data) ? data.length : 'not array');
      if (Array.isArray(data)) {
        console.log('📡 API: Sample data (first 2 items):', data.slice(0, 2));
      } else {
        console.log('📡 API: Response data:', data);
      }
    } else {
      const text = await response.text();
      console.log('📡 API: Non-JSON response:', text);
      data = text;
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data 
        ? (data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`)
        : `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ API: Request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ API: Request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: Request error:', errorMessage);
    console.error('❌ API: Error details:', error);
    
    // Show toast for critical errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Network Error",
        description: "Cannot reach server. Check your internet connection.",
        variant: "destructive",
      });
    }
    
    return { error: errorMessage };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: "DELETE" }),
    
  uploadCsv: async <T>(endpoint: string, csvData: any[], userId: number): Promise<ApiResponse<T>> => {
    console.log('📤 API: Uploading CSV data to FastAPI:', { endpoint, dataLength: csvData.length, userId });
    
    return fetchApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        diamonds: csvData
      }),
    });
  },
};
