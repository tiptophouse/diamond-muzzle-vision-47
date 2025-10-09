import { useState, useEffect, useCallback } from 'react';
import { useTelegramCloudStorage } from './useTelegramCloudStorage';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
}

export interface AdminDashboardCache {
  stats: AdminStats;
  blockedUsersCount: number;
  averageEngagement: number;
  totalDiamonds: number;
  realTimeStats: {
    todayLogins: number;
    weeklyLogins: number;
    monthlyLogins: number;
  };
  subscriptionStats: {
    activeSubscriptions: number;
    totalRevenue: number;
  };
  lastUpdated: number;
}

const CACHE_KEY = 'admin_dashboard_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAdminDataCache() {
  const { isSupported, getItem, setItem } = useTelegramCloudStorage();
  const [cachedData, setCachedData] = useState<AdminDashboardCache | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  // Load cached data on mount
  useEffect(() => {
    const loadCache = async () => {
      if (!isSupported) {
        setIsLoadingCache(false);
        return;
      }

      try {
        const cached = await getItem(CACHE_KEY);
        if (cached) {
          const parsed: AdminDashboardCache = JSON.parse(cached);
          const age = Date.now() - parsed.lastUpdated;
          
          // Use cache if it's fresh
          if (age < CACHE_DURATION) {
            console.log('📦 Admin cache loaded (age:', Math.floor(age / 1000), 'seconds)');
            setCachedData(parsed);
          } else {
            console.log('⏰ Admin cache expired');
          }
        }
      } catch (error) {
        console.error('❌ Failed to load admin cache:', error);
      } finally {
        setIsLoadingCache(false);
      }
    };

    loadCache();
  }, [isSupported, getItem]);

  // Save data to cache
  const saveToCache = useCallback(async (data: Omit<AdminDashboardCache, 'lastUpdated'>) => {
    if (!isSupported) return false;

    try {
      const cacheData: AdminDashboardCache = {
        ...data,
        lastUpdated: Date.now(),
      };
      
      await setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCachedData(cacheData);
      console.log('✅ Admin data cached successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save admin cache:', error);
      return false;
    }
  }, [isSupported, setItem]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCachedData(null);
  }, []);

  return {
    cachedData,
    isLoadingCache,
    saveToCache,
    clearCache,
    isCacheSupported: isSupported,
  };
}
