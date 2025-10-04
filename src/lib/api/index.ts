
// Export all public API functions and types
import { http } from '@/api/http';

// Create api adapter for backward compatibility
export const api = {
  get: <T>(endpoint: string) => http<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: Record<string, any>) => 
    http<T>(endpoint, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  put: <T>(endpoint: string, body: Record<string, any>) =>
    http<T>(endpoint, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  delete: <T>(endpoint: string) => http<T>(endpoint, { method: 'DELETE' }),
  uploadCsv: async <T>(endpoint: string, csvData: any[], userId: number) =>
    http<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, diamonds: csvData })
    })
};

export { apiEndpoints } from './endpoints';
export { setCurrentUserId, getCurrentUserId, API_BASE_URL } from './config';
export { 
  verifyTelegramUser, 
  signInToBackend,
  getBackendAuthToken,
  type TelegramVerificationResponse 
} from './auth';
