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
      return;
    }

    const mainButton = (window as any).Telegram.WebApp.MainButton;

    // Set button properties
    mainButton.setText(text);
    
    if (color) {
      mainButton.color = color;
    }
    
    if (textColor) {
      mainButton.textColor = textColor;
    }

    // Set visibility and state
    if (isVisible) {
      mainButton.show();
      
      if (isEnabled) {
        mainButton.enable();
      } else {
        mainButton.disable();
      }
    } else {
      mainButton.hide();
    }

    // Set click handler
    if (onClick) {
      mainButton.onClick(onClick);
    }

    // Cleanup function
    return () => {
      mainButton.hide();
      if (onClick) {
        mainButton.offClick(onClick);
      }
    };
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