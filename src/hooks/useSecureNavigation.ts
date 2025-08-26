
import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from './useEnhancedTelegramWebApp';
import { useCentralizedNavigation } from './useCentralizedNavigation';

export function useSecureNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { haptics, isInitialized } = useEnhancedTelegramWebApp();
  const { configureNavigation, releaseNavigation, isReady } = useCentralizedNavigation();

  // Enhanced back button with proper cleanup
  const showSecureBackButton = useCallback((onClick?: () => void) => {
    if (!isInitialized) return '';

    const handler = onClick || (() => {
      haptics.light();
      navigate(-1);
    });

    return configureNavigation({
      showBackButton: true,
      onBackClick: handler,
      priority: 3 // Higher priority for manual configuration
    });
  }, [isInitialized, haptics, navigate, configureNavigation]);

  // Enhanced main button with proper cleanup
  const showSecureMainButton = useCallback((text: string, onClick?: () => void, color?: string) => {
    if (!isInitialized) return '';

    return configureNavigation({
      showMainButton: true,
      mainButtonText: text,
      mainButtonColor: color || '#007AFF',
      onMainClick: onClick,
      priority: 3 // Higher priority for manual configuration
    });
  }, [isInitialized, configureNavigation]);

  return {
    showBackButton: showSecureBackButton,
    hideBackButton: (id: string) => releaseNavigation(id),
    showMainButton: showSecureMainButton,
    hideMainButton: (id: string) => releaseNavigation(id),
    cleanupNavigation: () => {}, // No longer needed with centralized system
    haptics,
    isReady
  };
}
