
// Export all public API functions and types
export { api, fetchApi } from './client';
export { apiEndpoints } from './endpoints';
export { setCurrentUserId, getCurrentUserId, API_BASE_URL } from './config';
export { 
  verifyTelegramUser, 
  signInToBackend,
  getBackendAuthToken,
  clearBackendAuthToken,
  type TelegramVerificationResponse 
} from './auth';
