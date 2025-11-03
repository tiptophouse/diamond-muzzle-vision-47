import { useEffect, useState, useCallback, useRef } from 'react';
import { useTelegramHapticFeedback } from './useTelegramHapticFeedback';
import { useTelegramSDK2Context } from '@/providers/TelegramSDK2Provider';

interface MainButtonOptions {
  backgroundColor?: string;
  textColor?: string;
  text?: string;
  isVisible?: boolean;
  isActive?: boolean;
  hapticFeedback?: boolean;
  hideOnUnmount?: boolean;
}

export function useTelegramMainButton(
  text: string = 'Continue',
  onClick?: () => void,
  options: MainButtonOptions = {}
) {
  const {
    backgroundColor = '#007AFF',
    textColor = '#FFFFFF',
    isVisible = false,
    isActive = true,
    hapticFeedback = true,
    hideOnUnmount = true
  } = options;

  const haptic = useTelegramHapticFeedback();
  const { webApp } = useTelegramSDK2Context();
  const clickHandlerRef = useRef(onClick);
  const [isSetup, setIsSetup] = useState(false);
  
  // Update ref when onClick changes
  useEffect(() => {
    clickHandlerRef.current = onClick;
  }, [onClick]);

  // Check if Telegram WebApp is available
  if (!webApp?.MainButton) {
    console.warn('⚠️ Telegram WebApp MainButton not available');
    return {
      show: () => {},
      hide: () => {},
      enable: () => {},
      disable: () => {},
      showProgress: () => {},
      hideProgress: () => {},
      setText: (newText: string) => {},
      setParams: (params: Partial<MainButtonOptions>) => {},
      isAvailable: false
    };
  }

  const mainButton = webApp.MainButton;

  // Setup main button
  useEffect(() => {
    if (!mainButton || isSetup) return;

    try {
      // Configure button
      mainButton.text = text;
      mainButton.color = backgroundColor;
      mainButton.textColor = textColor;

      // Setup click handler with haptic feedback
      const handleClick = () => {
        if (hapticFeedback) {
          haptic.impactOccurred('medium');
        }
        clickHandlerRef.current?.();
      };

      // Clear previous handler and set new one
      mainButton.offClick(handleClick);
      mainButton.onClick(handleClick);

      // Set initial state
      if (isActive) {
        mainButton.enable();
      } else {
        mainButton.disable();
      }

      if (isVisible) {
        mainButton.show();
      } else {
        mainButton.hide();
      }

      setIsSetup(true);
      console.log('✅ MainButton configured:', { text, isVisible, isActive });

      // Cleanup on unmount
      return () => {
        if (hideOnUnmount) {
          mainButton.hide();
        }
        mainButton.offClick(handleClick);
        setIsSetup(false);
      };
    } catch (error) {
      console.error('❌ Error setting up MainButton:', error);
    }
  }, [text, backgroundColor, textColor, isVisible, isActive, hapticFeedback, hideOnUnmount, mainButton, isSetup, haptic]);

  // Return control functions
  return {
    show: () => mainButton?.show(),
    hide: () => mainButton?.hide(),
    enable: () => mainButton?.enable(),
    disable: () => mainButton?.disable(),
    showProgress: () => mainButton?.showProgress(),
    hideProgress: () => mainButton?.hideProgress(),
    setText: (newText: string) => mainButton?.setText(newText),
    setParams: (params: Partial<MainButtonOptions>) => {
      if (!mainButton) return;
      if (params.backgroundColor) mainButton.color = params.backgroundColor;
      if (params.textColor) mainButton.textColor = params.textColor;
      if (params.text) mainButton.text = params.text;
      if (params.isActive !== undefined) {
        params.isActive ? mainButton.enable() : mainButton.disable();
      }
      if (params.isVisible !== undefined) {
        params.isVisible ? mainButton.show() : mainButton.hide();
      }
    },
    isAvailable: true
  };
}
