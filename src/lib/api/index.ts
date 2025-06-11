
// Export all public API functions and types
export { api, fetchApi, resetFallbackFlag } from './client';
export { apiEndpoints } from './endpoints';
export { setCurrentUserId, getCurrentUserId, API_BASE_URL } from './config';
export { 
  verifyTelegramUser, 
  getVerificationResult, 
  type TelegramVerificationResponse 
} from './auth';
