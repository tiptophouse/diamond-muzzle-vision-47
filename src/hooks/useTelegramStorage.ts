import { useEffect, useState, useCallback } from 'react';
import { cloudStorage } from '@telegram-apps/sdk';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

interface StoredData {
  diamonds: Diamond[];
  lastUpdated: number;
  userPreferences: {
    favoriteShapes: string[];
    priceRange: [number, number];
    colorPreferences: string[];
    clarityPreferences: string[];
  };
  searchHistory: string[];
  recentlyViewed: string[];
}

export function useTelegramStorage() {
  const [isCloudStorageReady, setIsCloudStorageReady] = useState(false);
  const [localData, setLocalData] = useState<StoredData>({
    diamonds: [],
    lastUpdated: 0,
    userPreferences: {
      favoriteShapes: [],
      priceRange: [0, 100000],
      colorPreferences: [],
      clarityPreferences: []
    },
    searchHistory: [],
    recentlyViewed: []
  });

  // Initialize Telegram Cloud Storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        setIsCloudStorageReady(cloudStorage.isSupported());
        
        if (cloudStorage.isSupported()) {
          await loadStoredData();
          console.log('📱 Telegram Cloud Storage initialized successfully');
        } else {
          console.log('📱 Using fallback localStorage');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('📱 Cloud Storage init failed:', error);
        loadFromLocalStorage();
      }
    };

    initStorage();
  }, []);

  // Load data from Telegram Cloud Storage
  const loadStoredData = useCallback(async () => {
    if (!cloudStorage.isSupported()) {
      loadFromLocalStorage();
      return;
    }

    try {
      const keys = await cloudStorage.getKeys();
      const dataKeys = ['diamonds', 'userPreferences', 'searchHistory', 'recentlyViewed'];
      
      if (keys.length > 0) {
        const storedData = await cloudStorage.getItem(dataKeys);
        
        setLocalData({
          diamonds: storedData.diamonds ? JSON.parse(storedData.diamonds) : [],
          lastUpdated: Date.now(),
          userPreferences: storedData.userPreferences ? JSON.parse(storedData.userPreferences) : {
            favoriteShapes: [],
            priceRange: [0, 100000],
            colorPreferences: [],
            clarityPreferences: []
          },
          searchHistory: storedData.searchHistory ? JSON.parse(storedData.searchHistory) : [],
          recentlyViewed: storedData.recentlyViewed ? JSON.parse(storedData.recentlyViewed) : []
        });
        
        console.log('📱 Loaded data from Telegram Cloud Storage');
      }
    } catch (error) {
      console.error('📱 Failed to load from cloud storage:', error);
      loadFromLocalStorage();
    }
  }, []);

  // Fallback to localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('telegram-diamond-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalData(parsed);
        console.log('📱 Loaded data from localStorage');
      }
    } catch (error) {
      console.error('📱 Failed to load from localStorage:', error);
    }
  }, []);

  // Save diamonds to storage
  const saveDiamonds = useCallback(async (diamonds: Diamond[]) => {
    const newData = { ...localData, diamonds, lastUpdated: Date.now() };
    setLocalData(newData);

    try {
      if (cloudStorage.isSupported() && cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem('diamonds', JSON.stringify(diamonds));
        await cloudStorage.setItem('lastUpdated', Date.now().toString());
        console.log('💎 Saved', diamonds.length, 'diamonds to Telegram Cloud Storage');
      } else {
        localStorage.setItem('telegram-diamond-data', JSON.stringify(newData));
        console.log('💎 Saved', diamonds.length, 'diamonds to localStorage');
      }
    } catch (error) {
      console.error('💎 Failed to save diamonds:', error);
      toast.error('Failed to save diamonds locally');
    }
  }, [localData]);

  // Save user preferences
  const saveUserPreferences = useCallback(async (preferences: StoredData['userPreferences']) => {
    const newData = { ...localData, userPreferences: preferences, lastUpdated: Date.now() };
    setLocalData(newData);

    try {
      if (cloudStorage.isSupported() && cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem('userPreferences', JSON.stringify(preferences));
        console.log('⚙️ Saved user preferences to Telegram Cloud Storage');
      } else {
        localStorage.setItem('telegram-diamond-data', JSON.stringify(newData));
        console.log('⚙️ Saved user preferences to localStorage');
      }
    } catch (error) {
      console.error('⚙️ Failed to save preferences:', error);
    }
  }, [localData]);

  // Add to search history
  const addToSearchHistory = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [searchTerm, ...localData.searchHistory.filter(term => term !== searchTerm)].slice(0, 20);
    const newData = { ...localData, searchHistory: newHistory, lastUpdated: Date.now() };
    setLocalData(newData);

    try {
      if (cloudStorage.isSupported() && cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } else {
        localStorage.setItem('telegram-diamond-data', JSON.stringify(newData));
      }
    } catch (error) {
      console.error('🔍 Failed to save search history:', error);
    }
  }, [localData]);

  // Add to recently viewed
  const addToRecentlyViewed = useCallback(async (diamondId: string) => {
    const newRecentlyViewed = [diamondId, ...localData.recentlyViewed.filter(id => id !== diamondId)].slice(0, 50);
    const newData = { ...localData, recentlyViewed: newRecentlyViewed, lastUpdated: Date.now() };
    setLocalData(newData);

    try {
      if (cloudStorage.isSupported() && cloudStorage.setItem.isAvailable()) {
        await cloudStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
      } else {
        localStorage.setItem('telegram-diamond-data', JSON.stringify(newData));
      }
    } catch (error) {
      console.error('👁️ Failed to save recently viewed:', error);
    }
  }, [localData]);

  // Clear all stored data
  const clearStoredData = useCallback(async () => {
    try {
      if (cloudStorage.isSupported() && cloudStorage.deleteItem.isAvailable()) {
        await cloudStorage.deleteItem(['diamonds', 'userPreferences', 'searchHistory', 'recentlyViewed', 'lastUpdated']);
        console.log('🗑️ Cleared all data from Telegram Cloud Storage');
      } else {
        localStorage.removeItem('telegram-diamond-data');
        console.log('🗑️ Cleared all data from localStorage');
      }
      
      setLocalData({
        diamonds: [],
        lastUpdated: 0,
        userPreferences: {
          favoriteShapes: [],
          priceRange: [0, 100000],
          colorPreferences: [],
          clarityPreferences: []
        },
        searchHistory: [],
        recentlyViewed: []
      });
      
      toast.success('All stored data cleared');
    } catch (error) {
      console.error('🗑️ Failed to clear stored data:', error);
      toast.error('Failed to clear stored data');
    }
  }, []);

  // Get storage info
  const getStorageInfo = useCallback(async () => {
    try {
      if (cloudStorage.isSupported() && cloudStorage.getKeys.isAvailable()) {
        const keys = await cloudStorage.getKeys();
        return {
          type: 'Telegram Cloud Storage',
          keysCount: keys.length,
          isSupported: true,
          lastUpdated: localData.lastUpdated
        };
      } else {
        const stored = localStorage.getItem('telegram-diamond-data');
        return {
          type: 'Browser localStorage',
          size: stored ? new Blob([stored]).size : 0,
          isSupported: false,
          lastUpdated: localData.lastUpdated
        };
      }
    } catch (error) {
      console.error('📊 Failed to get storage info:', error);
      return {
        type: 'Unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        isSupported: false,
        lastUpdated: 0
      };
    }
  }, [localData.lastUpdated]);

  return {
    // State
    isCloudStorageReady,
    localData,
    
    // Actions
    saveDiamonds,
    saveUserPreferences,
    addToSearchHistory,
    addToRecentlyViewed,
    clearStoredData,
    loadStoredData,
    getStorageInfo,
    
    // Getters
    getDiamonds: () => localData.diamonds,
    getUserPreferences: () => localData.userPreferences,
    getSearchHistory: () => localData.searchHistory,
    getRecentlyViewed: () => localData.recentlyViewed,
    
    // Storage type
    storageType: cloudStorage.isSupported() ? 'cloud' : 'local'
  };
}