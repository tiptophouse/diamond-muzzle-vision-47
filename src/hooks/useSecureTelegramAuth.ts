// This hook is deprecated - use useStrictTelegramAuth instead
// Keeping this as a redirect to prevent breaking changes

import { useStrictTelegramAuth } from './useStrictTelegramAuth';

export function useSecureTelegramAuth() {
  console.warn('⚠️ useSecureTelegramAuth is deprecated - use useStrictTelegramAuth instead');
  return useStrictTelegramAuth();
}
