
import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

interface NavigationOptions {
  showBackButton?: boolean;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onMainButtonClick?: () => void;
  onBackButtonClick?: () => void;
}

export function useTelegramNavigation(options: NavigationOptions = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Haptic feedback methods
  const haptics = {
    light: useCallback(() => WebApp.HapticFeedback?.impactOccurred('light'), []),
    medium: useCallback(() => WebApp.HapticFeedback?.impactOccurred('medium'), []),
    heavy: useCallback(() => WebApp.HapticFeedback?.impactOccurred('heavy'), []),
    success: useCallback(() => WebApp.HapticFeedback?.notificationOccurred('success'), []),
    error: useCallback(() => WebApp.HapticFeedback?.notificationOccurred('error'), []),
    selection: useCallback(() => WebApp.HapticFeedback?.selectionChanged(), [])
  };

  // Back button management
  const configureBackButton = useCallback((show: boolean, onClick?: () => void) => {
    if (!WebApp.BackButton) return;

    if (show) {
      const handler = onClick || (() => {
        haptics.light();
        navigate(-1);
      });
      WebApp.BackButton.onClick(handler);
      WebApp.BackButton.show();
    } else {
      WebApp.BackButton.hide();
    }
  }, [navigate, haptics]);

  // Main button management
  const configureMainButton = useCallback((show: boolean, text?: string, onClick?: () => void, color?: string) => {
    if (!WebApp.MainButton) return;

    if (show && text) {
      WebApp.MainButton.setText(text);
      if (color) WebApp.MainButton.color = color;
      if (onClick) {
        WebApp.MainButton.onClick(() => {
          haptics.medium();
          onClick();
        });
      }
      WebApp.MainButton.show();
    } else {
      WebApp.MainButton.hide();
    }
  }, [haptics]);

  // Auto-configure based on route
  useEffect(() => {
    const path = location.pathname;
    const opts = optionsRef.current;

    // Route-specific navigation setup
    if (path === '/inventory') {
      configureBackButton(false);
      configureMainButton(true, 'Add Diamond', () => navigate('/upload-single-stone'), '#059669');
    } else if (path === '/upload-single-stone' || path === '/upload' || path.startsWith('/diamond/')) {
      configureBackButton(true, opts.onBackButtonClick);
      configureMainButton(opts.showMainButton || false, opts.mainButtonText, opts.onMainButtonClick, opts.mainButtonColor);
    } else if (path === '/admin' || path === '/settings') {
      configureBackButton(true, opts.onBackButtonClick);
      configureMainButton(false);
    } else {
      // Default: no navigation buttons for main pages
      configureBackButton(opts.showBackButton || false, opts.onBackButtonClick);
      configureMainButton(opts.showMainButton || false, opts.mainButtonText, opts.onMainButtonClick, opts.mainButtonColor);
    }

    // Cleanup on unmount
    return () => {
      if (WebApp.BackButton) WebApp.BackButton.hide();
      if (WebApp.MainButton) WebApp.MainButton.hide();
    };
  }, [location.pathname, configureBackButton, configureMainButton]);

  return {
    haptics,
    showBackButton: (onClick?: () => void) => configureBackButton(true, onClick),
    hideBackButton: () => configureBackButton(false),
    showMainButton: (text: string, onClick?: () => void, color?: string) => 
      configureMainButton(true, text, onClick, color),
    hideMainButton: () => configureMainButton(false)
  };
}
