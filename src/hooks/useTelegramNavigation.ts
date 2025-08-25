
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramWebApp } from './useTelegramWebApp';

export function useTelegramNavigation() {
  const navigate = useNavigate();
  const { webApp, setHeaderColor, setBackgroundColor, hapticFeedback } = useTelegramWebApp();

  const navigateWithColor = useCallback((path: string, headerColor?: string, bgColor?: string) => {
    if (headerColor && headerColor.startsWith('#')) {
      setHeaderColor(headerColor);
    }
    if (bgColor && bgColor.startsWith('#')) {
      setBackgroundColor(bgColor);
    }
    navigate(path);
  }, [navigate, setHeaderColor, setBackgroundColor]);

  const setThemeColors = useCallback((headerColor?: string, bgColor?: string) => {
    if (headerColor && headerColor.startsWith('#')) {
      setHeaderColor(headerColor);
    }
    if (bgColor && bgColor.startsWith('#')) {
      setBackgroundColor(bgColor);
    }
  }, [setHeaderColor, setBackgroundColor]);

  const goBack = useCallback(() => {
    if (webApp?.BackButton?.isVisible) {
      webApp.BackButton.hide();
    }
    navigate(-1);
  }, [navigate, webApp]);

  const showBackButton = useCallback((callback?: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      if (callback) {
        webApp.BackButton.onClick(callback);
      } else {
        webApp.BackButton.onClick(goBack);
      }
    }
  }, [webApp, goBack]);

  const hideBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  }, [webApp]);

  return {
    navigate,
    navigateWithColor,
    setThemeColors,
    goBack,
    showBackButton,
    hideBackButton,
    webApp,
    haptics: hapticFeedback,
  };
}
