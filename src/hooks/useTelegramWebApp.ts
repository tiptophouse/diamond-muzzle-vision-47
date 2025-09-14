// Legacy Telegram WebApp hook - replaced with optimized version
// This file is maintained for backward compatibility
import { useOptimizedTelegramWebApp } from './useOptimizedTelegramWebApp';

// Export the optimized version with legacy naming for compatibility
export function useTelegramWebApp() {
  console.warn('⚠️ useTelegramWebApp is deprecated. Use useOptimizedTelegramWebApp or useTelegramSDK instead.');
  
  const optimized = useOptimizedTelegramWebApp();
  
  // Map to legacy interface for backward compatibility
  return {
    webApp: optimized.webApp,
    user: optimized.user,
    isReady: optimized.isReady,
    theme: optimized.theme,
    isLoading: !optimized.isInitialized,
    platform: 'telegram', // Legacy compatibility
    
    // Methods
    ready: optimized.ready,
    expand: optimized.expand,
    close: optimized.closeApp,
    
    // Haptic feedback - legacy compatibility
    hapticFeedback: {
      impactOccurred: optimized.impactHaptic,
      notificationOccurred: optimized.notificationHaptic,
      selectionChanged: optimized.selectionHaptic,
      // Legacy aliases for backward compatibility
      impact: optimized.impactHaptic,
      notification: optimized.notificationHaptic,
      selection: optimized.selectionHaptic,
    },
    
    // Button controls - legacy compatibility
    mainButton: {
      show: optimized.showMainButton,
      hide: optimized.hideMainButton,
    },
    
    backButton: {
      show: optimized.showBackButton,
      hide: optimized.hideBackButton,
    },
    
    // Direct methods for backward compatibility
    impactOccurred: optimized.impactHaptic,
    notificationOccurred: optimized.notificationHaptic,
    selectionChanged: optimized.selectionHaptic,
    showMainButton: optimized.showMainButton,
    hideMainButton: optimized.hideMainButton,
    showBackButton: optimized.showBackButton,
    hideBackButton: optimized.hideBackButton,
  };
}

// Export optimized version as default
export { useOptimizedTelegramWebApp } from './useOptimizedTelegramWebApp';
export { useTelegramSDK } from './useTelegramSDK';