import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTelegramWebApp } from './useTelegramWebApp';

interface NavigationConfig {
  showBackButton?: boolean;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onBackClick?: () => void;
  onMainButtonClick?: () => void;
  enableHapticFeedback?: boolean;
}

export function useTelegramNavigation(config: NavigationConfig = {}) {
  const {
    showBackButton = false,
    showMainButton = false,
    mainButtonText = 'Continue',
    mainButtonColor = '#007AFF',
    onBackClick,
    onMainButtonClick,
    enableHapticFeedback = true
  } = config;

  const navigate = useNavigate();
  const location = useLocation();
  const { webApp, mainButton, backButton, hapticFeedback } = useTelegramWebApp();
  const configRef = useRef(config);

  // Update config ref when props change
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Back button handler
  const handleBackClick = useCallback(() => {
    if (enableHapticFeedback) {
      hapticFeedback.impact('medium');
    }

    if (configRef.current.onBackClick) {
      configRef.current.onBackClick();
    } else {
      // Default behavior - go back or to home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  }, [navigate, hapticFeedback, enableHapticFeedback]);

  // Main button handler
  const handleMainButtonClick = useCallback(() => {
    if (enableHapticFeedback) {
      hapticFeedback.impact('light');
    }

    if (configRef.current.onMainButtonClick) {
      configRef.current.onMainButtonClick();
    }
  }, [hapticFeedback, enableHapticFeedback]);

  // Configure buttons based on config
  useEffect(() => {
    if (!webApp) return;

    if (showBackButton) {
      backButton.show(handleBackClick);
    } else {
      backButton.hide();
    }

    if (showMainButton && onMainButtonClick) {
      mainButton.show(mainButtonText, handleMainButtonClick, mainButtonColor);
    } else {
      mainButton.hide();
    }

    // Cleanup on unmount
    return () => {
      backButton.hide();
      mainButton.hide();
    };
  }, [
    showBackButton,
    showMainButton,
    mainButtonText,
    mainButtonColor,
    handleBackClick,
    handleMainButtonClick,
    webApp,
    mainButton,
    backButton,
    onMainButtonClick
  ]);

  // Auto-configure based on route
  useEffect(() => {
    const isDetailPage = location.pathname.includes('/diamond/');
    const isStorePage = location.pathname === '/' || location.pathname === '/store';
    
    // Auto-show back button for detail pages unless explicitly configured
    if (isDetailPage && showBackButton === undefined) {
      backButton.show(handleBackClick);
    }

    // Hide back button on store/home pages unless explicitly configured
    if (isStorePage && showBackButton === undefined) {
      backButton.hide();
    }
  }, [location.pathname, showBackButton, backButton, handleBackClick]);

  // Navigation helpers
  const navigateWithFeedback = useCallback((path: string) => {
    if (enableHapticFeedback) {
      hapticFeedback.selection();
    }
    navigate(path);
  }, [navigate, hapticFeedback, enableHapticFeedback]);

  const goBack = useCallback(() => {
    handleBackClick();
  }, [handleBackClick]);

  // Share functionality optimized for Telegram
  const shareContent = useCallback(async (title: string, text: string, url?: string) => {
    if (enableHapticFeedback) {
      hapticFeedback.impact('light');
    }

    const tgWebApp = window.Telegram?.WebApp as any;
    if (tgWebApp && tgWebApp.switchInlineQuery) {
      try {
        const shareText = url ? `${text}\n\n${url}` : text;
        tgWebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels']);
        return;
      } catch (error) {
        console.log('Telegram share failed, using fallback');
      }
    }

    // Fallback to Web Share API or clipboard
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        console.log('Web Share failed, using clipboard');
      }
    }

    // Final fallback - clipboard
    const shareContent = url ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${text}`;
    await navigator.clipboard.writeText(shareContent);
  }, [webApp, hapticFeedback, enableHapticFeedback]);

  // Contact functionality optimized for Telegram
  const contactViaMessage = useCallback((message: string, recipientId?: string) => {
    if (enableHapticFeedback) {
      hapticFeedback.impact('medium');
    }

    const tgWebApp = window.Telegram?.WebApp as any;
    if (tgWebApp && tgWebApp.switchInlineQuery) {
      try {
        // Use Telegram's inline query for messaging
        tgWebApp.switchInlineQuery(message, ['users']);
        return;
      } catch (error) {
        console.log('Telegram contact failed, using fallback');
      }
    }

    // Fallback - open Telegram share
    const telegramUrl = `https://t.me/share/url?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  }, [webApp, hapticFeedback, enableHapticFeedback]);

  return {
    navigateWithFeedback,
    goBack,
    shareContent,
    contactViaMessage,
    hapticFeedback,
    isReady: !!webApp
  };
}