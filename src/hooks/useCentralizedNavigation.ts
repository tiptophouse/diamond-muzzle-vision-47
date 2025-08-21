
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigationManager } from '@/utils/NavigationManager';
import { useEnhancedTelegramWebApp } from './useEnhancedTelegramWebApp';

interface NavigationConfig {
  showBackButton?: boolean;
  onBackClick?: () => void;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onMainClick?: () => void;
  priority?: number;
}

export function useCentralizedNavigation(config?: NavigationConfig) {
  const navigate = useNavigate();
  const location = useLocation();
  const { haptics, isInitialized } = useEnhancedTelegramWebApp();
  const activeButtonsRef = useRef<{ back?: boolean; main?: boolean }>({});

  const configureNavigation = useCallback((customConfig?: NavigationConfig) => {
    if (!isInitialized) return '';

    const finalConfig = { ...config, ...customConfig };
    const requestId = `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Default back handler
    const defaultBackHandler = () => {
      haptics.light();
      navigate(-1);
    };

    // Configure back button
    if (finalConfig.showBackButton) {
      navigationManager.showBackButton(finalConfig.onBackClick || defaultBackHandler);
      activeButtonsRef.current.back = true;
    }

    // Configure main button
    if (finalConfig.showMainButton && finalConfig.mainButtonText) {
      navigationManager.showMainButton(
        finalConfig.mainButtonText,
        finalConfig.onMainClick || (() => {})
      );
      activeButtonsRef.current.main = true;
    }

    return requestId;
  }, [config, isInitialized, haptics, navigate]);

  // Auto-configure based on route
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname;
    let autoConfig: NavigationConfig = {};

    // Route-based configuration
    if (currentPath.startsWith('/diamond/')) {
      autoConfig = {
        showBackButton: true,
        priority: 2,
        onBackClick: () => {
          haptics.medium();
          navigate('/store');
        }
      };
    } else if (currentPath === '/inventory') {
      autoConfig = {
        showMainButton: true,
        mainButtonText: 'Add Diamond',
        mainButtonColor: '#059669',
        priority: 1,
        onMainClick: () => {
          haptics.medium();
          navigate('/upload-single-stone');
        }
      };
    } else if (currentPath.includes('/upload')) {
      autoConfig = {
        showBackButton: true,
        priority: 2
      };
    } else if (currentPath === '/settings') {
      autoConfig = {
        showBackButton: true,
        priority: 2
      };
    }

    const requestId = configureNavigation(autoConfig);
    
    // Cleanup on route change
    return () => {
      if (activeButtonsRef.current.back) {
        navigationManager.hideBackButton();
        activeButtonsRef.current.back = false;
      }
      if (activeButtonsRef.current.main) {
        navigationManager.hideMainButton();
        activeButtonsRef.current.main = false;
      }
    };
  }, [location.pathname, isInitialized, configureNavigation, haptics, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      navigationManager.cleanup();
    };
  }, []);

  const releaseNavigation = useCallback((id: string) => {
    // Simple cleanup
    if (activeButtonsRef.current.back) {
      navigationManager.hideBackButton();
      activeButtonsRef.current.back = false;
    }
    if (activeButtonsRef.current.main) {
      navigationManager.hideMainButton();
      activeButtonsRef.current.main = false;
    }
  }, []);

  return {
    configureNavigation,
    releaseNavigation,
    haptics,
    isReady: isInitialized
  };
}
