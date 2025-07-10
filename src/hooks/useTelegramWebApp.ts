import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TelegramWebApp, 
  TelegramUser, 
  TelegramInitData,
  ThemeParams,
  initializeTelegramWebApp,
  setupIOSOptimizations,
  isIOS,
  isAndroid
} from '@/utils/telegramWebApp';
import { useToast } from '@/hooks/use-toast';

interface TelegramWebAppState {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  initData: TelegramInitData | null;
  isInTelegram: boolean;
  isLoading: boolean;
  themeParams: ThemeParams | null;
  viewportHeight: number;
  isExpanded: boolean;
  colorScheme: 'light' | 'dark' | null;
  platform: string | null;
  version: string | null;
}

interface MainButtonConfig {
  text: string;
  color?: string;
  textColor?: string;
  isActive?: boolean;
  isVisible?: boolean;
  onClick?: () => void;
}

export function useTelegramWebApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [state, setState] = useState<TelegramWebAppState>({
    webApp: null,
    user: null,
    initData: null,
    isInTelegram: false,
    isLoading: true,
    themeParams: null,
    viewportHeight: 0,
    isExpanded: false,
    colorScheme: null,
    platform: null,
    version: null
  });
  
  const backButtonCallbackRef = useRef<(() => void) | null>(null);
  const mainButtonCallbackRef = useRef<(() => void) | null>(null);
  const viewportChangedCallbackRef = useRef<(() => void) | null>(null);
  const themeChangedCallbackRef = useRef<(() => void) | null>(null);
  
  // Initialize Telegram WebApp
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        // Setup iOS optimizations first
        if (isIOS()) {
          setupIOSOptimizations();
        }
        
        const result = await initializeTelegramWebApp();
        
        if (!mounted) return;
        
        setState(prev => ({
          ...prev,
          webApp: result.webApp,
          user: result.user,
          initData: result.initData,
          isInTelegram: result.isInTelegram,
          isLoading: false,
          themeParams: result.webApp?.themeParams || null,
          viewportHeight: result.webApp?.viewportStableHeight || result.webApp?.viewportHeight || window.innerHeight,
          isExpanded: result.webApp?.isExpanded || false,
          colorScheme: result.webApp?.colorScheme || null,
          platform: result.webApp?.platform || (isIOS() ? 'ios' : isAndroid() ? 'android' : 'unknown'),
          version: result.webApp?.version || null
        }));
        
        // Setup event listeners
        if (result.webApp) {
          setupEventListeners(result.webApp);
        }
        
      } catch (error) {
        console.error('Failed to initialize Telegram WebApp:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isInTelegram: false
          }));
        }
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  // Setup event listeners
  const setupEventListeners = useCallback((webApp: TelegramWebApp) => {
    // Viewport changed listener
    const viewportChangedCallback = () => {
      setState(prev => ({
        ...prev,
        viewportHeight: webApp.viewportStableHeight || webApp.viewportHeight,
        isExpanded: webApp.isExpanded
      }));
    };
    
    // Theme changed listener
    const themeChangedCallback = () => {
      setState(prev => ({
        ...prev,
        themeParams: webApp.themeParams,
        colorScheme: webApp.colorScheme
      }));
    };
    
    viewportChangedCallbackRef.current = viewportChangedCallback;
    themeChangedCallbackRef.current = themeChangedCallback;
    
    webApp.onEvent('viewportChanged', viewportChangedCallback);
    webApp.onEvent('themeChanged', themeChangedCallback);
    
    return () => {
      webApp.offEvent('viewportChanged', viewportChangedCallback);
      webApp.offEvent('themeChanged', themeChangedCallback);
    };
  }, []);
  
  // BackButton management
  const showBackButton = useCallback((callback?: () => void) => {
    if (!state.webApp) return;
    
    // Clear previous callback
    if (backButtonCallbackRef.current) {
      state.webApp.BackButton.offClick(backButtonCallbackRef.current);
    }
    
    const backCallback = callback || (() => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    });
    
    backButtonCallbackRef.current = backCallback;
    state.webApp.BackButton.onClick(backCallback);
    state.webApp.BackButton.show();
  }, [state.webApp, navigate]);
  
  const hideBackButton = useCallback(() => {
    if (!state.webApp) return;
    
    if (backButtonCallbackRef.current) {
      state.webApp.BackButton.offClick(backButtonCallbackRef.current);
      backButtonCallbackRef.current = null;
    }
    
    state.webApp.BackButton.hide();
  }, [state.webApp]);
  
  // MainButton management
  const setMainButton = useCallback((config: MainButtonConfig) => {
    if (!state.webApp) return;
    
    const {
      text,
      color = '#2481cc',
      textColor = '#ffffff',
      isActive = true,
      isVisible = true,
      onClick
    } = config;
    
    // Clear previous callback
    if (mainButtonCallbackRef.current) {
      state.webApp.MainButton.offClick(mainButtonCallbackRef.current);
    }
    
    // Set button properties
    state.webApp.MainButton.setParams({
      text,
      color,
      text_color: textColor,
      is_active: isActive,
      is_visible: isVisible
    });
    
    // Set click handler
    if (onClick) {
      mainButtonCallbackRef.current = onClick;
      state.webApp.MainButton.onClick(onClick);
    }
    
    if (isVisible) {
      state.webApp.MainButton.show();
    } else {
      state.webApp.MainButton.hide();
    }
  }, [state.webApp]);
  
  const hideMainButton = useCallback(() => {
    if (!state.webApp) return;
    
    if (mainButtonCallbackRef.current) {
      state.webApp.MainButton.offClick(mainButtonCallbackRef.current);
      mainButtonCallbackRef.current = null;
    }
    
    state.webApp.MainButton.hide();
  }, [state.webApp]);
  
  // Haptic feedback
  const hapticFeedback = useCallback((type: 'impact' | 'notification' | 'selection', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning') => {
    if (!state.webApp?.HapticFeedback) return;
    
    switch (type) {
      case 'impact':
        state.webApp.HapticFeedback.impactOccurred(style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' || 'medium');
        break;
      case 'notification':
        state.webApp.HapticFeedback.notificationOccurred(style as 'error' | 'success' | 'warning' || 'success');
        break;
      case 'selection':
        state.webApp.HapticFeedback.selectionChanged();
        break;
    }
  }, [state.webApp]);
  
  // Utility functions
  const showAlert = useCallback((message: string) => {
    if (!state.webApp) {
      toast({
        title: "Alert",
        description: message,
      });
      return;
    }
    
    state.webApp.showAlert(message);
  }, [state.webApp, toast]);
  
  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!state.webApp) {
        const confirmed = window.confirm(message);
        resolve(confirmed);
        return;
      }
      
      state.webApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    });
  }, [state.webApp]);
  
  const openLink = useCallback((url: string, tryInstantView = false) => {
    if (!state.webApp) {
      window.open(url, '_blank');
      return;
    }
    
    state.webApp.openLink(url, { try_instant_view: tryInstantView });
  }, [state.webApp]);
  
  const readClipboard = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!state.webApp?.readTextFromClipboard) {
        // Fallback for non-Telegram environments
        if (navigator.clipboard) {
          navigator.clipboard.readText()
            .then(resolve)
            .catch(() => resolve(null));
        } else {
          resolve(null);
        }
        return;
      }
      
      state.webApp.readTextFromClipboard((text) => {
        resolve(text || null);
      });
    });
  }, [state.webApp]);
  
  const close = useCallback(() => {
    if (!state.webApp) {
      window.close();
      return;
    }
    
    state.webApp.close();
  }, [state.webApp]);
  
  // Auto-manage back button based on route
  useEffect(() => {
    if (!state.webApp || state.isLoading) return;
    
    const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';
    
    if (isHomePage) {
      hideBackButton();
    } else {
      showBackButton();
    }
  }, [location.pathname, state.webApp, state.isLoading, showBackButton, hideBackButton]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.webApp) {
        hideBackButton();
        hideMainButton();
        
        // Clean up all event listeners
        if (viewportChangedCallbackRef.current) {
          state.webApp.offEvent('viewportChanged', viewportChangedCallbackRef.current);
        }
        if (themeChangedCallbackRef.current) {
          state.webApp.offEvent('themeChanged', themeChangedCallbackRef.current);
        }
      }
    };
  }, [state.webApp, hideBackButton, hideMainButton]);
  
  return {
    // State
    ...state,
    
    // Device info
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    
    // Button management
    showBackButton,
    hideBackButton,
    setMainButton,
    hideMainButton,
    
    // Utilities
    hapticFeedback,
    showAlert,
    showConfirm,
    openLink,
    readClipboard,
    close,
    
    // Direct WebApp access for advanced usage
    webApp: state.webApp,
  };
}