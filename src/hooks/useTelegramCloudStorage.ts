import { useCallback, useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

/**
 * SDK 2.0 Enhanced Cloud Storage Hook
 * Store user preferences, filters, recent searches, bookmarks
 * Up to 1024 key-value pairs per user
 */
export function useTelegramCloudStorage() {
  const { webApp } = useTelegramWebApp();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(!!(webApp?.CloudStorage));
  }, [webApp]);

  const setItem = useCallback(async (key: string, value: string): Promise<boolean> => {
    if (!webApp?.CloudStorage || !isSupported) return false;

    return new Promise((resolve) => {
      webApp.CloudStorage.setItem(key, value, (error) => {
        if (error) {
          console.error('CloudStorage setItem error:', error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }, [webApp, isSupported]);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (!webApp?.CloudStorage || !isSupported) return null;

    return new Promise((resolve) => {
      webApp.CloudStorage.getItem(key, (error, value) => {
        if (error) {
          console.error('CloudStorage getItem error:', error);
          resolve(null);
        } else {
          resolve(value || null);
        }
      });
    });
  }, [webApp, isSupported]);

  const getItems = useCallback(async (keys: string[]): Promise<Record<string, string>> => {
    if (!webApp?.CloudStorage || !isSupported) return {};

    return new Promise((resolve) => {
      webApp.CloudStorage.getItems(keys, (error, values) => {
        if (error) {
          console.error('CloudStorage getItems error:', error);
          resolve({});
        } else {
          resolve(values || {});
        }
      });
    });
  }, [webApp, isSupported]);

  const removeItem = useCallback(async (key: string): Promise<boolean> => {
    if (!webApp?.CloudStorage || !isSupported) return false;

    return new Promise((resolve) => {
      webApp.CloudStorage.removeItem(key, (error) => {
        if (error) {
          console.error('CloudStorage removeItem error:', error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }, [webApp, isSupported]);

  const removeItems = useCallback(async (keys: string[]): Promise<boolean> => {
    if (!webApp?.CloudStorage || !isSupported) return false;

    return new Promise((resolve) => {
      webApp.CloudStorage.removeItems(keys, (error) => {
        if (error) {
          console.error('CloudStorage removeItems error:', error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }, [webApp, isSupported]);

  const getKeys = useCallback(async (): Promise<string[]> => {
    if (!webApp?.CloudStorage || !isSupported) return [];

    return new Promise((resolve) => {
      webApp.CloudStorage.getKeys((error, keys) => {
        if (error) {
          console.error('CloudStorage getKeys error:', error);
          resolve([]);
        } else {
          resolve(keys || []);
        }
      });
    });
  }, [webApp, isSupported]);

  // Helper methods for common use cases
  const savePreferences = useCallback(async (preferences: Record<string, any>): Promise<boolean> => {
    const stringified = JSON.stringify(preferences);
    return setItem('user_preferences', stringified);
  }, [setItem]);

  const getPreferences = useCallback(async (): Promise<Record<string, any> | null> => {
    const value = await getItem('user_preferences');
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }, [getItem]);

  const saveRecentSearch = useCallback(async (search: string): Promise<boolean> => {
    const recent = await getItem('recent_searches');
    let searches: string[] = [];
    
    if (recent) {
      try {
        searches = JSON.parse(recent);
      } catch {}
    }

    searches = [search, ...searches.filter(s => s !== search)].slice(0, 10);
    return setItem('recent_searches', JSON.stringify(searches));
  }, [getItem, setItem]);

  const getRecentSearches = useCallback(async (): Promise<string[]> => {
    const value = await getItem('recent_searches');
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }, [getItem]);

  return {
    isSupported,
    setItem,
    getItem,
    getItems,
    removeItem,
    removeItems,
    getKeys,
    savePreferences,
    getPreferences,
    saveRecentSearch,
    getRecentSearches
  };
}
