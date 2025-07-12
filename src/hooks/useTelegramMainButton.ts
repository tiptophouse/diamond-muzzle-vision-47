import { useEffect, useCallback } from 'react';

interface UseMainButtonOptions {
  text: string;
  isVisible?: boolean;
  isEnabled?: boolean;
  color?: string;
  textColor?: string;
  onClick?: () => void;
}

export function useTelegramMainButton({
  text,
  isVisible = false,
  isEnabled = true,
  color,
  textColor,
  onClick
}: UseMainButtonOptions) {
  
  const setupMainButton = useCallback(() => {
    if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp?.MainButton) {
      console.warn('Telegram WebApp MainButton not available');
      return;
    }

    const mainButton = (window as any).Telegram.WebApp.MainButton;

    try {
      // Set button properties
      mainButton.setText(text);
      
      if (color) {
        mainButton.color = color;
      }
      
      if (textColor) {
        mainButton.textColor = textColor;
      }

      // Clear any existing click handlers
      if (mainButton.offClick) {
        mainButton.offClick();
      }

      // Set click handler before showing/enabling
      if (onClick) {
        mainButton.onClick(onClick);
      }

      // Set visibility and state
      if (isVisible) {
        if (isEnabled) {
          mainButton.enable();
        } else {
          mainButton.disable();
        }
        mainButton.show();
      } else {
        mainButton.hide();
      }

      console.log('MainButton configured:', { text, isVisible, isEnabled, color });

      // Cleanup function
      return () => {
        try {
          mainButton.hide();
          if (mainButton.offClick) {
            mainButton.offClick();
          }
        } catch (cleanupError) {
          console.warn('MainButton cleanup error:', cleanupError);
        }
      };
    } catch (error) {
      console.error('Error setting up MainButton:', error);
    }
  }, [text, isVisible, isEnabled, color, textColor, onClick]);

  useEffect(() => {
    const cleanup = setupMainButton();
    return cleanup;
  }, [setupMainButton]);

  // Return control functions
  return {
    show: () => (window as any).Telegram?.WebApp?.MainButton?.show(),
    hide: () => (window as any).Telegram?.WebApp?.MainButton?.hide(),
    enable: () => (window as any).Telegram?.WebApp?.MainButton?.enable(),
    disable: () => (window as any).Telegram?.WebApp?.MainButton?.disable(),
    showProgress: () => (window as any).Telegram?.WebApp?.MainButton?.showProgress(),
    hideProgress: () => (window as any).Telegram?.WebApp?.MainButton?.hideProgress(),
    setText: (newText: string) => (window as any).Telegram?.WebApp?.MainButton?.setText(newText),
  };
}