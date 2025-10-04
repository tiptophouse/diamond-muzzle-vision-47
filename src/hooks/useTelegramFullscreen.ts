import { useCallback, useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface FullscreenState {
  isFullscreen: boolean;
  isSupported: boolean;
}

/**
 * SDK 2.0 Fullscreen API Hook
 * Provides access to native fullscreen mode for immersive experiences
 * Use for: Diamond 360° viewer, certificate viewer, AI chat, media galleries
 */
export function useTelegramFullscreen() {
  const { webApp } = useTelegramWebApp();
  const [state, setState] = useState<FullscreenState>({
    isFullscreen: false,
    isSupported: false
  });

  useEffect(() => {
    if (!webApp) return;

    // Check SDK 2.0 fullscreen support
    const isSupported = typeof webApp.requestFullscreen === 'function' &&
                       typeof webApp.exitFullscreen === 'function';

    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      // Listen for fullscreen changes
      const handleFullscreenChanged = () => {
        setState(prev => ({
          ...prev,
          isFullscreen: webApp.isFullscreen || false
        }));
      };

      webApp.onEvent('fullscreenChanged', handleFullscreenChanged);

      return () => {
        webApp.offEvent('fullscreenChanged', handleFullscreenChanged);
      };
    }
  }, [webApp]);

  const requestFullscreen = useCallback(() => {
    if (webApp && state.isSupported && webApp.requestFullscreen) {
      webApp.requestFullscreen();
    }
  }, [webApp, state.isSupported]);

  const exitFullscreen = useCallback(() => {
    if (webApp && state.isSupported && webApp.exitFullscreen) {
      webApp.exitFullscreen();
    }
  }, [webApp, state.isSupported]);

  const toggleFullscreen = useCallback(() => {
    if (state.isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  }, [state.isFullscreen, requestFullscreen, exitFullscreen]);

  return {
    isFullscreen: state.isFullscreen,
    isSupported: state.isSupported,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
