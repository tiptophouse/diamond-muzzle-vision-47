import { useCallback, useEffect, useState } from 'react';

/**
 * Telegram Cloud Storage Hook - Best Practice Implementation
 * Uses window.Telegram.WebApp.CloudStorage for reliable access
 * Enables offline caching and cross-device sync (up to 1024 key-value pairs)
 */
export function useTelegramCloudStorage() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    try {
      const hasCloudStorage = !!(window.Telegram?.WebApp?.CloudStorage);
      setIsSupported(hasCloudStorage);
      if (hasCloudStorage) {
        console.log('✅ Telegram CloudStorage initialized');
      } else {
        console.log('⚠️ CloudStorage not available (Telegram version < 6.9)');
      }
    } catch (error) {
      console.error('❌ CloudStorage initialization failed:', error);
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string): Promise<boolean> => {
    if (!isSupported || !window.Telegram?.WebApp?.CloudStorage) {
      console.warn('CloudStorage not available, falling back to localStorage');
      try {
        localStorage.setItem(`tg_cloud_${key}`, value);
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      window.Telegram.WebApp.CloudStorage.setItem(key, value, (error) => {
        if (error) {
          console.error(`❌ CloudStorage.setItem("${key}") failed:`, error);
          resolve(false);
        } else {
          console.log(`✅ CloudStorage.set("${key}")`);
          resolve(true);
        }
      });
    });
  }, [isSupported]);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (!isSupported || !window.Telegram?.WebApp?.CloudStorage) {
      try {
        return localStorage.getItem(`tg_cloud_${key}`);
      } catch {
        return null;
      }
    }

    return new Promise((resolve) => {
      window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
        if (error) {
          console.error(`❌ CloudStorage.getItem("${key}") failed:`, error);
          resolve(null);
        } else {
          resolve(value || null);
        }
      });
    });
  }, [isSupported]);

  const getItems = useCallback(async (keys: string[]): Promise<Record<string, string>> => {
    if (!isSupported || !window.Telegram?.WebApp?.CloudStorage) return {};

    return new Promise((resolve) => {
      window.Telegram.WebApp.CloudStorage.getItems(keys, (error, values) => {
        if (error) {
          console.error('CloudStorage getItems error:', error);
          resolve({});
        } else {
          resolve(values || {});
        }
      });
    });
  }, [isSupported]);

  const removeItem = useCallback(async (key: string): Promise<boolean> => {
    if (!isSupported || !window.Telegram?.WebApp?.CloudStorage) {
      try {
        localStorage.removeItem(`tg_cloud_${key}`);
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      window.Telegram.WebApp.CloudStorage.removeItem(key, (error) => {
        if (error) {
          console.error(`❌ CloudStorage.removeItem("${key}") failed:`, error);
          resolve(false);
        } else {
          console.log(`✅ CloudStorage.delete("${key}")`);
          resolve(true);
        }
      });
    });
  }, [isSupported]);

  const removeItems = useCallback(async (keys: string[]): Promise<boolean> => {
    if (!isSupported || !window.Telegram?.WebApp?.CloudStorage) return false;

    return new Promise((resolve) => {
      window.Telegram.WebApp.CloudStorage.removeItems(keys, (error) => {
        if (error) {
          console.error('CloudStorage removeItems error:', error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }, [isSupported]);

  const getKeys = useCallback(async (): Promise<string[]> => {
    if (!isSupported || !window.Telegram?.WebApp?.CloudStorage) {
      const keys: string[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('tg_cloud_')) {
            keys.push(key.replace('tg_cloud_', ''));
          }
        }
      } catch {}
      return keys;
    }

    return new Promise((resolve) => {
      window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
        if (error) {
          console.error('CloudStorage getKeys error:', error);
          resolve([]);
        } else {
          resolve(keys || []);
        }
      });
    });
  }, [isSupported]);

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
