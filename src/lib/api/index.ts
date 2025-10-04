
// Export all public API functions and types
import { http } from '@/api/http';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Create api adapter for backward compatibility with { data, error } response structure
export const api = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const data = await http<T>(endpoint, { method: 'GET' });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  post: async <T>(endpoint: string, body: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const data = await http<T>(endpoint, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  put: async <T>(endpoint: string, body: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const data = await http<T>(endpoint, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const data = await http<T>(endpoint, { method: 'DELETE' });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  uploadCsv: async <T>(endpoint: string, csvData: any[], userId: number): Promise<ApiResponse<T>> => {
    try {
      const data = await http<T>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, diamonds: csvData })
      });
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

export { apiEndpoints } from './endpoints';
export { setCurrentUserId, getCurrentUserId, API_BASE_URL } from './config';
export { 
  verifyTelegramUser, 
  signInToBackend,
  getBackendAuthToken,
  type TelegramVerificationResponse 
} from './auth';
