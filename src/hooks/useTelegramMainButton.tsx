import { useEffect, useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface MainButtonOptions {
  text?: string;
  color?: string;
  textColor?: string;
  isVisible?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  hapticFeedback?: boolean;
}

/**
 * Hook to control Telegram's MainButton
 * This is a native button at the bottom of the Telegram Mini App
 */
export function useTelegramMainButton(options: MainButtonOptions = {}) {
  const { webApp, isReady } = useTelegramWebApp();
  
  const {
    text = 'Continue',
    color,
    textColor,
    isVisible = false,
    isActive = true,
    onClick,
    hapticFeedback = true
  } = options;

  // Show the button
  const show = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.show();
    }
  }, [webApp]);

  // Hide the button
  const hide = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  }, [webApp]);

  // Enable the button
  const enable = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.enable();
    }
  }, [webApp]);

  // Disable the button
  const disable = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.disable();
    }
  }, [webApp]);

  // Show progress indicator
  const showProgress = useCallback((leaveActive = false) => {
    if (webApp?.MainButton) {
      webApp.MainButton.showProgress(leaveActive);
    }
  }, [webApp]);

  // Hide progress indicator
  const hideProgress = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.hideProgress();
    }
  }, [webApp]);

  // Set button text
  const setText = useCallback((newText: string) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(newText);
    }
  }, [webApp]);

  // Set button params
  const setParams = useCallback((params: Partial<MainButtonOptions>) => {
    if (webApp?.MainButton) {
      const mainButtonParams: any = {};
      
      if (params.text) mainButtonParams.text = params.text;
      if (params.color) mainButtonParams.color = params.color;
      if (params.textColor) mainButtonParams.text_color = params.textColor;
      if (params.isVisible !== undefined) mainButtonParams.is_visible = params.isVisible;
      if (params.isActive !== undefined) mainButtonParams.is_active = params.isActive;
      
      webApp.MainButton.setParams(mainButtonParams);
    }
  }, [webApp]);

  // Initialize button
  useEffect(() => {
    if (!isReady || !webApp?.MainButton) return;

    // Set initial params
    setParams({ text, color, textColor, isActive });

    // Set visibility
    if (isVisible) {
      show();
    } else {
      hide();
    }
  }, [isReady, webApp, text, color, textColor, isVisible, isActive, setParams, show, hide]);

  // Handle click
  useEffect(() => {
    if (!isReady || !webApp?.MainButton || !onClick) return;

    const handleClick = () => {
      if (hapticFeedback && webApp.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('medium');
      }
      onClick();
    };

    webApp.MainButton.onClick(handleClick);

    return () => {
      if (webApp?.MainButton?.offClick) {
        webApp.MainButton.offClick(handleClick);
      }
    };
  }, [isReady, webApp, onClick, hapticFeedback]);

  return {
    show,
    hide,
    enable,
    disable,
    showProgress,
    hideProgress,
    setText,
    setParams,
    isAvailable: !!(webApp?.MainButton)
  };
}
