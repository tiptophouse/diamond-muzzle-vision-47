
// Export all public API functions and types
export { api, fetchApi } from './client';
export { fastApi, fetchFastApi, deleteDiamondViaFastApi } from './fastApiClient';
export { apiEndpoints, fastApiEndpoints } from './endpoints';
export { setCurrentUserId, getCurrentUserId, API_BASE_URL, FASTAPI_BASE_URL, getFastApiUrl } from './config';
export { 
  verifyTelegramUser, 
  getVerificationResult, 
  type TelegramVerificationResponse 
} from './auth';
