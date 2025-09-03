import { useCallback, useEffect, useState } from 'react';
import { useAdvancedTelegramSDK } from './useAdvancedTelegramSDK';

interface CloudStorageHook {
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  saveUserPreferences: (preferences: any) => Promise<void>;
  getUserPreferences: () => Promise<any>;
  
  // Search history
  saveSearchHistory: (query: string) => Promise<void>;
  getSearchHistory: () => Promise<string[]>;
  clearSearchHistory: () => Promise<void>;
  
  // Filters
  saveFilters: (filters: any) => Promise<void>;
  getFilters: () => Promise<any>;
  
  // Recent diamonds
  saveRecentDiamond: (diamond: any) => Promise<void>;
  getRecentDiamonds: () => Promise<any[]>;
  
  // Wishlist sync
  syncWishlist: (wishlist: any[]) => Promise<void>;
  getWishlist: () => Promise<any[]>;
  
  // Generic storage
  setItem: (key: string, value: any) => Promise<void>;
  getItem: <T = any>(key: string, defaultValue?: T) => Promise<T>;
  removeItem: (key: string) => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  clear: () => Promise<void>;
}

const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SEARCH_HISTORY: 'search_history',
  FILTERS: 'current_filters',
  RECENT_DIAMONDS: 'recent_diamonds',
  WISHLIST: 'wishlist_sync',
} as const;

export function useTelegramCloudStorage(): CloudStorageHook {
  const { cloudStorage, isInitialized } = useAdvancedTelegramSDK();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      // Check if cloud storage is available
      setIsSupported(true); // Our implementation has fallbacks
    }
  }, [isInitialized]);

  const handleError = (error: any, operation: string) => {
    console.error(`Cloud storage ${operation} error:`, error);
    const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
    setError(errorMessage);
  };

  // Generic storage methods
  const setItem = useCallback(async (key: string, value: any): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const serializedValue = JSON.stringify(value);
      await cloudStorage.setItem(key, serializedValue);
      
      console.log(`☁️ Saved to cloud storage: ${key}`);
    } catch (error) {
      handleError(error, 'save item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cloudStorage]);

  const getItem = useCallback(async <T = any>(key: string, defaultValue?: T): Promise<T> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const serializedValue = await cloudStorage.getItem(key);
      
      if (serializedValue === null) {
        return defaultValue as T;
      }
      
      const value = JSON.parse(serializedValue);
      console.log(`☁️ Retrieved from cloud storage: ${key}`);
      return value as T;
    } catch (error) {
      handleError(error, 'get item');
      return defaultValue as T;
    } finally {
      setIsLoading(false);
    }
  }, [cloudStorage]);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      setError(null);
      await cloudStorage.removeItem(key);
      console.log(`☁️ Removed from cloud storage: ${key}`);
    } catch (error) {
      handleError(error, 'remove item');
      throw error;
    }
  }, [cloudStorage]);

  const getAllKeys = useCallback(async (): Promise<string[]> => {
    try {
      return await cloudStorage.getKeys();
    } catch (error) {
      handleError(error, 'get keys');
      return [];
    }
  }, [cloudStorage]);

  const clear = useCallback(async (): Promise<void> => {
    try {
      const keys = await getAllKeys();
      await Promise.all(keys.map(key => removeItem(key)));
      console.log('☁️ Cleared all cloud storage');
    } catch (error) {
      handleError(error, 'clear storage');
      throw error;
    }
  }, [getAllKeys, removeItem]);

  // User preferences
  const saveUserPreferences = useCallback(async (preferences: any): Promise<void> => {
    await setItem(STORAGE_KEYS.USER_PREFERENCES, {
      ...preferences,
      lastUpdated: Date.now()
    });
  }, [setItem]);

  const getUserPreferences = useCallback(async (): Promise<any> => {
    return await getItem(STORAGE_KEYS.USER_PREFERENCES, {});
  }, [getItem]);

  // Search history
  const saveSearchHistory = useCallback(async (query: string): Promise<void> => {
    const history = await getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
    
    // Remove existing query and add to beginning
    const filteredHistory = history.filter(h => h !== query);
    const updatedHistory = [query, ...filteredHistory].slice(0, 20); // Keep last 20 searches
    
    await setItem(STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
  }, [getItem, setItem]);

  const getSearchHistory = useCallback(async (): Promise<string[]> => {
    return await getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
  }, [getItem]);

  const clearSearchHistory = useCallback(async (): Promise<void> => {
    await removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  }, [removeItem]);

  // Filters
  const saveFilters = useCallback(async (filters: any): Promise<void> => {
    await setItem(STORAGE_KEYS.FILTERS, {
      ...filters,
      lastApplied: Date.now()
    });
  }, [setItem]);

  const getFilters = useCallback(async (): Promise<any> => {
    return await getItem(STORAGE_KEYS.FILTERS, {});
  }, [getItem]);

  // Recent diamonds
  const saveRecentDiamond = useCallback(async (diamond: any): Promise<void> => {
    const recent = await getItem<any[]>(STORAGE_KEYS.RECENT_DIAMONDS, []);
    
    // Remove existing diamond and add to beginning
    const filteredRecent = recent.filter(d => d.id !== diamond.id);
    const updatedRecent = [diamond, ...filteredRecent].slice(0, 50); // Keep last 50 viewed diamonds
    
    await setItem(STORAGE_KEYS.RECENT_DIAMONDS, updatedRecent);
  }, [getItem, setItem]);

  const getRecentDiamonds = useCallback(async (): Promise<any[]> => {
    return await getItem<any[]>(STORAGE_KEYS.RECENT_DIAMONDS, []);
  }, [getItem]);

  // Wishlist sync
  const syncWishlist = useCallback(async (wishlist: any[]): Promise<void> => {
    await setItem(STORAGE_KEYS.WISHLIST, {
      items: wishlist,
      lastSynced: Date.now()
    });
  }, [setItem]);

  const getWishlist = useCallback(async (): Promise<any[]> => {
    const data = await getItem(STORAGE_KEYS.WISHLIST, { items: [] });
    return data.items || [];
  }, [getItem]);

  return {
    isSupported,
    isLoading,
    error,
    
    // User preferences
    saveUserPreferences,
    getUserPreferences,
    
    // Search history
    saveSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    
    // Filters
    saveFilters,
    getFilters,
    
    // Recent diamonds
    saveRecentDiamond,
    getRecentDiamonds,
    
    // Wishlist sync
    syncWishlist,
    getWishlist,
    
    // Generic storage
    setItem,
    getItem,
    removeItem,
    getAllKeys,
    clear
  };
}