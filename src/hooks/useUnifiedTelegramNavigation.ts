
import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from './useEnhancedTelegramWebApp';

interface NavigationConfig {
  showBackButton?: boolean;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onBackClick?: () => void;
  onMainButtonClick?: () => void;
}

export function useUnifiedTelegramNavigation(config?: NavigationConfig) {
  const location = useLocation();
  const navigate = useNavigate();
  const { webApp, isInitialized, navigation, haptics } = useEnhancedTelegramWebApp();
  
  // Track current handlers to prevent conflicts
  const currentConfigRef = useRef<NavigationConfig | null>(null);

  // Clean up navigation
  const cleanupNavigation = useCallback(() => {
    if (isInitialized && navigation) {
      navigation.hideBackButton();
      navigation.hideMainButton();
      currentConfigRef.current = null;
    }
  }, [isInitialized, navigation]);

  // Configure navigation with context awareness
  const configureNavigation = useCallback((customConfig?: NavigationConfig) => {
    if (!isInitialized || !webApp) return;

    const finalConfig = { ...config, ...customConfig };
    
    // Avoid unnecessary reconfigurations
    if (JSON.stringify(finalConfig) === JSON.stringify(currentConfigRef.current)) {
      return;
    }

    // Clean previous configuration
    cleanupNavigation();

    // Configure back button with context
    if (finalConfig.showBackButton) {
      const backHandler = finalConfig.onBackClick || (() => {
        haptics.light();
        
        // Context-aware back navigation
        const currentPath = location.pathname;
        
        if (currentPath.startsWith('/diamond/')) {
          navigate('/store');
        } else if (currentPath === '/upload-single-stone' || currentPath === '/upload') {
          navigate('/inventory');
        } else if (currentPath === '/settings') {
          navigate('/dashboard');
        } else {
          navigate(-1);
        }
      });
      
      navigation.showBackButton(backHandler);
    }

    // Configure main button with context
    if (finalConfig.showMainButton && finalConfig.mainButtonText) {
      const mainHandler = finalConfig.onMainButtonClick || (() => {
        haptics.medium();
      });
      
      navigation.showMainButton(
        finalConfig.mainButtonText,
        mainHandler,
        finalConfig.mainButtonColor || '#007AFF'
      );
    }

    currentConfigRef.current = finalConfig;
  }, [config, isInitialized, webApp, navigation, haptics, location.pathname, navigate, cleanupNavigation]);

  // Auto-configure based on route with better context awareness
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname;
    
    // Route-specific navigation configuration
    switch (true) {
      case currentPath.startsWith('/diamond/'):
        configureNavigation({
          showBackButton: true,
          onBackClick: () => {
            haptics.medium();
            navigate('/store');
          }
        });
        break;

      case currentPath === '/inventory':
        configureNavigation({
          showMainButton: true,
          mainButtonText: 'Add Diamond',
          mainButtonColor: '#059669',
          onMainButtonClick: () => {
            haptics.medium();
            navigate('/upload-single-stone');
          }
        });
        break;

      case currentPath === '/upload-single-stone':
      case currentPath === '/upload':
        configureNavigation({
          showBackButton: true,
          showMainButton: true,
          mainButtonText: 'Save Diamond',
          mainButtonColor: '#3b82f6',
          onBackClick: () => {
            haptics.light();
            navigate('/inventory');
          }
        });
        break;

      case currentPath === '/settings':
      case currentPath === '/standardize-csv':
        configureNavigation({
          showBackButton: true
        });
        break;

      default:
        // Clear navigation for main pages (dashboard, store, chat, insights)
        cleanupNavigation();
        break;
    }

    // Cleanup on unmount or route change
    return cleanupNavigation;
  }, [location.pathname, isInitialized, configureNavigation, cleanupNavigation, haptics, navigate]);

  return {
    configureNavigation,
    cleanupNavigation,
    showBackButton: (onClick?: () => void) => {
      configureNavigation({ showBackButton: true, onBackClick: onClick });
    },
    hideBackButton: () => {
      navigation.hideBackButton();
    },
    showMainButton: (text: string, onClick?: () => void, color?: string) => {
      configureNavigation({ 
        showMainButton: true, 
        mainButtonText: text, 
        onMainButtonClick: onClick,
        mainButtonColor: color 
      });
    },
    hideMainButton: () => {
      navigation.hideMainButton();
    },
    haptics,
    isReady: isInitialized
  };
}
