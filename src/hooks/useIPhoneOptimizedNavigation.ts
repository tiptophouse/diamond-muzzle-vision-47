
import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from './useEnhancedTelegramWebApp';

interface NavigationConfig {
  showBackButton?: boolean;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onBackClick?: () => void;
  onMainClick?: () => void;
}

export function useIPhoneOptimizedNavigation(config?: NavigationConfig) {
  const location = useLocation();
  const navigate = useNavigate();
  const { webApp, navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();

  const configureNavigation = useCallback((customConfig?: NavigationConfig) => {
    if (!isInitialized || !webApp) return;

    const finalConfig = { ...config, ...customConfig };

    // Always clear existing navigation first
    navigation.hideBackButton();
    navigation.hideMainButton();

    // Configure back button with enhanced iPhone support
    if (finalConfig.showBackButton) {
      const backHandler = finalConfig.onBackClick || (() => {
        haptics.light();
        navigate(-1);
      });
      navigation.showBackButton(backHandler);
    }

    // Configure main button with enhanced iPhone support
    if (finalConfig.showMainButton && finalConfig.mainButtonText) {
      navigation.showMainButton(
        finalConfig.mainButtonText,
        finalConfig.onMainClick,
        finalConfig.mainButtonColor || '#007AFF'
      );
    }
  }, [config, isInitialized, webApp, navigation, haptics, navigate]);

  // Auto-configure based on route for iPhone optimization
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname;
    
    // Auto-configuration for common patterns
    if (currentPath.startsWith('/diamond/')) {
      configureNavigation({
        showBackButton: true,
        onBackClick: () => {
          haptics.medium();
          navigate('/store');
        }
      });
    } else if (currentPath === '/inventory') {
      configureNavigation({
        showMainButton: true,
        mainButtonText: 'Add Diamond',
        mainButtonColor: '#059669',
        onMainClick: () => {
          haptics.medium();
          navigate('/upload-single-stone');
        }
      });
    } else if (currentPath.includes('/upload')) {
      configureNavigation({
        showBackButton: true,
        showMainButton: true,
        mainButtonText: 'Save Diamond',
        mainButtonColor: '#3b82f6'
      });
    } else if (currentPath === '/settings') {
      configureNavigation({
        showBackButton: true
      });
    } else {
      // Clear navigation for main pages
      configureNavigation({});
    }
  }, [location.pathname, isInitialized, configureNavigation, haptics, navigate]);

  return {
    configureNavigation,
    showBackButton: (onClick?: () => void) => navigation.showBackButton(onClick),
    hideBackButton: () => navigation.hideBackButton(),
    showMainButton: (text: string, onClick?: () => void, color?: string) => 
      navigation.showMainButton(text, onClick, color),
    hideMainButton: () => navigation.hideMainButton(),
    haptics,
    webApp,
    isReady: isInitialized
  };
}
