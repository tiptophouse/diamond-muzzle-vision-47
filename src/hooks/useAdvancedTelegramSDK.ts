import { useState, useEffect, useCallback, useRef } from 'react';
import WebApp from '@twa-dev/sdk';

interface AdvancedTelegramSDK {
  // Core WebApp
  webApp: typeof WebApp;
  isReady: boolean;
  
  // Performance optimizations
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    apiCalls: number;
    cacheHits: number;
  };
  
  // Advanced theme
  dynamicTheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  
  // Cloud storage
  cloudStorage: {
    set: (key: string, value: any) => Promise<void>;
    get: (key: string) => Promise<any>;
    remove: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  
  // Advanced haptics
  haptics: {
    light: () => void;
    medium: () => void;
    heavy: () => void;
    success: () => void;
    error: () => void;
    warning: () => void;
    selection: () => void;
    notification: (type: 'success' | 'error' | 'warning') => void;
  };
  
  // Advanced navigation
  navigation: {
    showBackButton: (onClick?: () => void) => void;
    hideBackButton: () => void;
    showMainButton: (text: string, onClick?: () => void, color?: string) => void;
    hideMainButton: () => void;
    enableSwipeToClose: () => void;
    disableSwipeToClose: () => void;
  };
  
  // Performance utilities
  utils: {
    preloadData: (key: string, fetcher: () => Promise<any>) => Promise<any>;
    optimizeImages: (urls: string[]) => void;
    batchOperations: (operations: (() => void)[]) => void;
    debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => T;
    throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => T;
  };
}

export function useAdvancedTelegramSDK(): AdvancedTelegramSDK {
  const [isReady, setIsReady] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0
  });
  const [dynamicTheme, setDynamicTheme] = useState({
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#000000',
    accent: '#FF3B30'
  });
  
  const startTime = useRef(Date.now());
  const cacheRef = useRef(new Map<string, { data: any; timestamp: number; ttl: number }>());
  const performanceRef = useRef(performanceMetrics);

  // Advanced initialization with performance tracking
  useEffect(() => {
    const initAdvancedSDK = async () => {
      try {
        console.log('🚀 Advanced Telegram SDK: Initializing...');
        const initStart = Date.now();
        
        // Initialize WebApp with all features
        WebApp.ready();
        WebApp.expand();
        
        // Enable all advanced features
        if (typeof WebApp.enableClosingConfirmation === 'function') {
          WebApp.enableClosingConfirmation();
        }
        
        // Advanced viewport optimizations
        if (typeof WebApp.enableVerticalSwipes === 'function') {
          WebApp.enableVerticalSwipes();
        }
        
        // Setup advanced theme integration
        setupAdvancedTheme();
        
        // Setup performance monitoring
        setupPerformanceMonitoring();
        
        // Setup cloud storage
        setupCloudStorage();
        
        const loadTime = Date.now() - initStart;
        setPerformanceMetrics(prev => ({ ...prev, loadTime }));
        performanceRef.current.loadTime = loadTime;
        
        setIsReady(true);
        console.log('✅ Advanced Telegram SDK: Ready in', loadTime, 'ms');
        
      } catch (error) {
        console.error('❌ Advanced Telegram SDK: Initialization failed:', error);
        setIsReady(true); // Fallback
      }
    };

    initAdvancedSDK();
  }, []);

  const setupAdvancedTheme = useCallback(() => {
    const theme = WebApp.themeParams;
    
    if (theme) {
      const newTheme = {
        primary: theme.button_color || '#007AFF',
        secondary: theme.secondary_bg_color || '#5856D6',
        background: theme.bg_color || '#FFFFFF',
        text: theme.text_color || '#000000',
        accent: theme.link_color || '#FF3B30'
      };
      
      setDynamicTheme(newTheme);
      
      // Apply to CSS custom properties with performance optimization
      requestAnimationFrame(() => {
        const root = document.documentElement;
        Object.entries(newTheme).forEach(([key, value]) => {
          root.style.setProperty(`--tg-${key}`, value);
        });
      });
      
      console.log('🎨 Advanced Theme: Applied dynamic colors');
    }
  }, []);

  const setupPerformanceMonitoring = useCallback(() => {
    // Monitor render performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setPerformanceMetrics(prev => ({
            ...prev,
            renderTime: prev.renderTime + entry.duration
          }));
        }
      });
    });
    
    if (typeof PerformanceObserver !== 'undefined') {
      observer.observe({ entryTypes: ['measure'] });
    }
  }, []);

  const setupCloudStorage = useCallback(() => {
    // Setup Telegram Cloud Storage if available
    if (WebApp.CloudStorage) {
      console.log('☁️ Telegram Cloud Storage: Available');
    } else {
      console.log('☁️ Telegram Cloud Storage: Using fallback');
    }
  }, []);

  // Advanced cloud storage with caching
  const cloudStorage = {
    set: async (key: string, value: any): Promise<void> => {
      try {
        const serialized = JSON.stringify(value);
        
        if (WebApp.CloudStorage) {
          await new Promise<void>((resolve, reject) => {
            WebApp.CloudStorage.setItem(key, serialized, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
        } else {
          localStorage.setItem(`tg_${key}`, serialized);
        }
        
        // Cache locally for instant access
        cacheRef.current.set(key, {
          data: value,
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000 // 5 minutes
        });
        
        console.log('☁️ Cloud Storage: Saved', key);
      } catch (error) {
        console.error('❌ Cloud Storage: Save failed', key, error);
      }
    },

    get: async (key: string): Promise<any> => {
      try {
        // Check local cache first
        const cached = cacheRef.current.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          performanceRef.current.cacheHits++;
          return cached.data;
        }
        
        let result;
        if (WebApp.CloudStorage) {
          result = await new Promise<string>((resolve, reject) => {
            WebApp.CloudStorage.getItem(key, (error, value) => {
              if (error) reject(error);
              else resolve(value || '');
            });
          });
        } else {
          result = localStorage.getItem(`tg_${key}`) || '';
        }
        
        const parsed = result ? JSON.parse(result) : null;
        
        // Update cache
        if (parsed) {
          cacheRef.current.set(key, {
            data: parsed,
            timestamp: Date.now(),
            ttl: 5 * 60 * 1000
          });
        }
        
        return parsed;
      } catch (error) {
        console.error('❌ Cloud Storage: Get failed', key, error);
        return null;
      }
    },

    remove: async (key: string): Promise<void> => {
      try {
        if (WebApp.CloudStorage) {
          await new Promise<void>((resolve, reject) => {
            WebApp.CloudStorage.removeItem(key, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
        } else {
          localStorage.removeItem(`tg_${key}`);
        }
        
        cacheRef.current.delete(key);
      } catch (error) {
        console.error('❌ Cloud Storage: Remove failed', key, error);
      }
    },

    clear: async (): Promise<void> => {
      try {
        if (WebApp.CloudStorage) {
          await new Promise<void>((resolve, reject) => {
            WebApp.CloudStorage.getKeys((error, keys) => {
              if (error) {
                reject(error);
                return;
              }
              
              keys?.forEach(key => {
                WebApp.CloudStorage.removeItem(key, () => {});
              });
              resolve();
            });
          });
        } else {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('tg_')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        cacheRef.current.clear();
      } catch (error) {
        console.error('❌ Cloud Storage: Clear failed', error);
      }
    }
  };

  // Enhanced haptics with performance optimization
  const haptics = {
    light: () => {
      if (WebApp.HapticFeedback?.impactOccurred) {
        WebApp.HapticFeedback.impactOccurred('light');
      }
    },
    medium: () => {
      if (WebApp.HapticFeedback?.impactOccurred) {
        WebApp.HapticFeedback.impactOccurred('medium');
      }
    },
    heavy: () => {
      if (WebApp.HapticFeedback?.impactOccurred) {
        WebApp.HapticFeedback.impactOccurred('heavy');
      }
    },
    success: () => {
      if (WebApp.HapticFeedback?.notificationOccurred) {
        WebApp.HapticFeedback.notificationOccurred('success');
      }
    },
    error: () => {
      if (WebApp.HapticFeedback?.notificationOccurred) {
        WebApp.HapticFeedback.notificationOccurred('error');
      }
    },
    warning: () => {
      if (WebApp.HapticFeedback?.notificationOccurred) {
        WebApp.HapticFeedback.notificationOccurred('warning');
      }
    },
    selection: () => {
      if (WebApp.HapticFeedback?.selectionChanged) {
        WebApp.HapticFeedback.selectionChanged();
      }
    },
    notification: (type: 'success' | 'error' | 'warning') => {
      if (WebApp.HapticFeedback?.notificationOccurred) {
        WebApp.HapticFeedback.notificationOccurred(type);
      }
    }
  };

  // Advanced navigation with state management
  const navigation = {
    showBackButton: (onClick?: () => void) => {
      if (WebApp.BackButton) {
        if (onClick) {
          WebApp.BackButton.onClick(onClick);
        }
        WebApp.BackButton.show();
      }
    },
    hideBackButton: () => {
      if (WebApp.BackButton) {
        WebApp.BackButton.hide();
      }
    },
    showMainButton: (text: string, onClick?: () => void, color?: string) => {
      if (WebApp.MainButton) {
        WebApp.MainButton.setText(text);
        if (color) WebApp.MainButton.color = color as `#${string}`;
        if (onClick) WebApp.MainButton.onClick(onClick);
        WebApp.MainButton.show();
      }
    },
    hideMainButton: () => {
      if (WebApp.MainButton) {
        WebApp.MainButton.hide();
      }
    },
    enableSwipeToClose: () => {
      if (typeof WebApp.enableVerticalSwipes === 'function') {
        WebApp.enableVerticalSwipes();
      }
    },
    disableSwipeToClose: () => {
      if (typeof WebApp.disableVerticalSwipes === 'function') {
        WebApp.disableVerticalSwipes();
      }
    }
  };

  // Performance utilities
  const utils = {
    preloadData: async (key: string, fetcher: () => Promise<any>): Promise<any> => {
      const cached = await cloudStorage.get(key);
      if (cached) {
        performanceRef.current.cacheHits++;
        return cached;
      }
      
      const data = await fetcher();
      await cloudStorage.set(key, data);
      return data;
    },

    optimizeImages: (urls: string[]) => {
      urls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    },

    batchOperations: (operations: (() => void)[]) => {
      requestAnimationFrame(() => {
        operations.forEach(op => op());
      });
    },

    debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      }) as T;
    },

    throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
      let inThrottle: boolean;
      return ((...args: any[]) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }) as T;
    }
  };

  return {
    webApp: WebApp,
    isReady,
    performanceMetrics,
    dynamicTheme,
    cloudStorage,
    haptics,
    navigation,
    utils
  };
}