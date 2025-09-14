/**
 * React Hook for Telegram CloudStorage
 * Provides persistent storage in Telegram Mini App environment
 */

import { useState, useEffect, useCallback } from 'react';
import { useTelegramSDK } from './useTelegramSDK';

interface CloudStorageState {
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: {
    priceAlerts: boolean;
    newInventory: boolean;
    dailyDigest: boolean;
  };
  defaultCurrency?: string;
  viewPreferences?: {
    gridSize: 'small' | 'medium' | 'large';
    showPrices: boolean;
    sortBy: 'price' | 'carat' | 'clarity' | 'color' | 'cut';
    sortOrder: 'asc' | 'desc';
  };
  favorites?: string[];
  lastViewedDiamond?: string;
  searchHistory?: string[];
}

const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SEARCH_HISTORY: 'search_history',
  FAVORITES: 'favorites',
  VIEW_STATE: 'view_state',
  LAST_SYNC: 'last_sync'
} as const;

export function useTelegramCloudStorage() {
  const { cloudStorage, features } = useTelegramSDK();
  const [state, setState] = useState<CloudStorageState>({
    isAvailable: false,
    isLoading: true,
    error: null
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    notifications: {
      priceAlerts: true,
      newInventory: true,
      dailyDigest: false
    },
    defaultCurrency: 'USD',
    viewPreferences: {
      gridSize: 'medium',
      showPrices: true,
      sortBy: 'price',
      sortOrder: 'desc'
    },
    favorites: [],
    searchHistory: []
  });

  // Initialize CloudStorage
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        if (!features.cloudStorage) {
          setState(prev => ({ 
            ...prev, 
            isAvailable: false, 
            isLoading: false,
            error: 'CloudStorage not available in this Telegram version' 
          }));
          return;
        }

        // Test storage availability
        await cloudStorage.setItem('test', 'test');
        await cloudStorage.removeItem('test');
        
        setState(prev => ({ 
          ...prev, 
          isAvailable: true, 
          isLoading: false,
          error: null 
        }));

        // Load existing preferences
        await loadPreferences();
        
      } catch (error) {
        console.error('CloudStorage initialization failed:', error);
        setState(prev => ({ 
          ...prev, 
          isAvailable: false, 
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      }
    };

    initializeStorage();
  }, [features.cloudStorage, cloudStorage]);

  // Load preferences from storage
  const loadPreferences = useCallback(async () => {
    if (!state.isAvailable) return;

    try {
      const stored = await cloudStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (stored) {
        const parsedPrefs = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsedPrefs }));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, [state.isAvailable, cloudStorage]);

  // Save preferences to storage
  const savePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    if (!state.isAvailable) return false;

    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      await cloudStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES, 
        JSON.stringify(updatedPrefs)
      );
      setPreferences(updatedPrefs);
      
      // Update last sync timestamp
      await cloudStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }, [state.isAvailable, preferences, cloudStorage]);

  // Add to search history
  const addToSearchHistory = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || !state.isAvailable) return;

    try {
      const history = preferences.searchHistory || [];
      const newHistory = [searchTerm, ...history.filter(term => term !== searchTerm)].slice(0, 10);
      
      await savePreferences({ searchHistory: newHistory });
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [preferences.searchHistory, savePreferences, state.isAvailable]);

  // Add/remove favorites
  const toggleFavorite = useCallback(async (diamondId: string) => {
    if (!state.isAvailable) return false;

    try {
      const favorites = preferences.favorites || [];
      const isFavorite = favorites.includes(diamondId);
      
      const newFavorites = isFavorite 
        ? favorites.filter(id => id !== diamondId)
        : [...favorites, diamondId];

      await savePreferences({ favorites: newFavorites });
      return !isFavorite;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  }, [preferences.favorites, savePreferences, state.isAvailable]);

  // Update view preferences
  const updateViewPreferences = useCallback(async (viewPrefs: Partial<UserPreferences['viewPreferences']>) => {
    const newViewPrefs = { ...preferences.viewPreferences, ...viewPrefs };
    return await savePreferences({ viewPreferences: newViewPrefs });
  }, [preferences.viewPreferences, savePreferences]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (notifications: Partial<UserPreferences['notifications']>) => {
    const newNotifications = { ...preferences.notifications, ...notifications };
    return await savePreferences({ notifications: newNotifications });
  }, [preferences.notifications, savePreferences]);

  // Set last viewed diamond
  const setLastViewedDiamond = useCallback(async (diamondId: string) => {
    if (!state.isAvailable) return;
    await savePreferences({ lastViewedDiamond: diamondId });
  }, [savePreferences, state.isAvailable]);

  // Clear all storage data
  const clearAllData = useCallback(async () => {
    if (!state.isAvailable) return false;

    try {
      const keys = await cloudStorage.getKeys();
      for (const key of keys) {
        await cloudStorage.removeItem(key);
      }
      
      // Reset to defaults
      setPreferences({
        theme: 'auto',
        notifications: {
          priceAlerts: true,
          newInventory: true,
          dailyDigest: false
        },
        defaultCurrency: 'USD',
        viewPreferences: {
          gridSize: 'medium',
          showPrices: true,
          sortBy: 'price',
          sortOrder: 'desc'
        },
        favorites: [],
        searchHistory: []
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }, [state.isAvailable, cloudStorage]);

  // Get storage usage info
  const getStorageInfo = useCallback(async () => {
    if (!state.isAvailable) return null;

    try {
      const keys = await cloudStorage.getKeys();
      const items = [];
      
      for (const key of keys) {
        const value = await cloudStorage.getItem(key);
        items.push({
          key,
          size: new Blob([value || '']).size,
          lastModified: key === STORAGE_KEYS.LAST_SYNC ? value : null
        });
      }
      
      return {
        totalKeys: keys.length,
        totalSize: items.reduce((sum, item) => sum + item.size, 0),
        items,
        lastSync: await cloudStorage.getItem(STORAGE_KEYS.LAST_SYNC)
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }, [state.isAvailable, cloudStorage]);

  return {
    // State
    ...state,
    preferences,
    
    // Methods
    savePreferences,
    loadPreferences,
    addToSearchHistory,
    toggleFavorite,
    updateViewPreferences,
    updateNotificationSettings,
    setLastViewedDiamond,
    clearAllData,
    getStorageInfo,
    
    // Computed values
    isFavorite: (diamondId: string) => preferences.favorites?.includes(diamondId) || false,
    searchHistory: preferences.searchHistory || [],
    favoriteCount: preferences.favorites?.length || 0
  };
}