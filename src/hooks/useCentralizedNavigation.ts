
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
  const requestIdRef = useRef<string>('');

  // Generate unique request ID
  const generateRequestId = useCallback(() => {
    return `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const configureNavigation = useCallback((customConfig?: NavigationConfig) => {
    if (!isInitialized) return;

    const finalConfig = { ...config, ...customConfig };
    const requestId = generateRequestId();
    requestIdRef.current = requestId;

    // Default back handler
    const defaultBackHandler = () => {
      haptics.light();
      navigate(-1);
    };

    navigationManager.requestNavigation({
      id: requestId,
      priority: finalConfig.priority || 1,
      showBackButton: finalConfig.showBackButton,
      onBackClick: finalConfig.onBackClick || defaultBackHandler,
      showMainButton: finalConfig.showMainButton,
      mainButtonText: finalConfig.mainButtonText,
      mainButtonColor: finalConfig.mainButtonColor || '#007AFF',
      onMainClick: finalConfig.onMainClick
    });

    return requestId;
  }, [config, isInitialized, haptics, navigate, generateRequestId]);

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
      if (requestId) {
        navigationManager.releaseNavigation(requestId);
      }
    };
  }, [location.pathname, isInitialized, configureNavigation, haptics, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestIdRef.current) {
        navigationManager.releaseNavigation(requestIdRef.current);
      }
    };
  }, []);

  return {
    configureNavigation,
    releaseNavigation: (id: string) => navigationManager.releaseNavigation(id),
    haptics,
    isReady: isInitialized
  };
}
