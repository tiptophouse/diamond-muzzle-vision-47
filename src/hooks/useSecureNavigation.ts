import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from './useEnhancedTelegramWebApp';

interface NavigationState {
  backButtonHandler: (() => void) | null;
  mainButtonHandler: (() => void) | null;
}

export function useSecureNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { webApp, isInitialized, navigation, haptics } = useEnhancedTelegramWebApp();
  const navigationState = useRef<NavigationState>({ backButtonHandler: null, mainButtonHandler: null });

  // Secure cleanup function to prevent button state conflicts
  const cleanupNavigation = useCallback(() => {
    try {
      if (navigationState.current.backButtonHandler) {
        navigation.hideBackButton();
        navigationState.current.backButtonHandler = null;
      }
      if (navigationState.current.mainButtonHandler) {
        navigation.hideMainButton();
        navigationState.current.mainButtonHandler = null;
      }
    } catch (error) {
      console.warn('Navigation cleanup warning:', error);
    }
  }, [navigation]);

  // Enhanced back button with proper cleanup
  const showSecureBackButton = useCallback((onClick?: () => void) => {
    if (!isInitialized) return;

    cleanupNavigation();

    const handler = onClick || (() => {
      haptics.light();
      navigate(-1);
    });

    navigationState.current.backButtonHandler = handler;
    navigation.showBackButton(handler);
  }, [isInitialized, cleanupNavigation, haptics, navigate, navigation]);

  // Enhanced main button with proper cleanup
  const showSecureMainButton = useCallback((text: string, onClick?: () => void, color?: string) => {
    if (!isInitialized) return;

    // Only cleanup main button, keep back button if present
    if (navigationState.current.mainButtonHandler) {
      navigation.hideMainButton();
    }

    navigationState.current.mainButtonHandler = onClick || (() => {});
    navigation.showMainButton(text, onClick, color);
  }, [isInitialized, navigation]);

  // Auto-configure navigation based on route with iPhone optimizations
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname;
    
    // Clean slate approach - clear all navigation first
    cleanupNavigation();

    // Configure based on current route
    switch (true) {
      case currentPath.startsWith('/diamond/'):
      case currentPath === '/upload-single-stone':
      case currentPath === '/upload':
      case currentPath === '/standardize-csv':
      case currentPath === '/settings':
        showSecureBackButton();
        break;

      case currentPath === '/inventory':
        showSecureMainButton('Add Diamond', () => {
          haptics.medium();
          navigate('/upload-single-stone');
        }, '#059669');
        break;

      case currentPath === '/store':
        // No navigation buttons for store
        break;

      default:
        // Clear navigation for other pages
        break;
    }

    // Cleanup on unmount or route change
    return cleanupNavigation;
  }, [location.pathname, isInitialized, cleanupNavigation, showSecureBackButton, showSecureMainButton, haptics, navigate]);

  return {
    showBackButton: showSecureBackButton,
    hideBackButton: () => {
      navigation.hideBackButton();
      navigationState.current.backButtonHandler = null;
    },
    showMainButton: showSecureMainButton,
    hideMainButton: () => {
      navigation.hideMainButton();
      navigationState.current.mainButtonHandler = null;
    },
    cleanupNavigation,
    haptics,
    isReady: isInitialized
  };
}
