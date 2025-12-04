import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserDiamondCount {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  diamond_count: number;
  last_upload?: string;
  status: 'active' | 'inactive';
  is_premium: boolean;
  subscription_plan: string;
  fastapi_status: 'connected' | 'no_data' | 'error';
  fetch_time_ms?: number;
}

interface DiamondCountStats {
  totalUsers: number;
  usersWithDiamonds: number;
  usersWithZeroDiamonds: number;
  totalDiamonds: number;
  avgDiamondsPerUser: number;
  premiumUsers: number;
  fastapiConnectedUsers: number;
}

interface FetchProgress {
  current: number;
  total: number;
  percentage: number;
  currentUser?: string;
}

// Separate cache class with validation
const CACHE_KEY = 'bulk_user_diamond_counts_v2';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

class BulkDiamondCountsCache {
  private static instance: BulkDiamondCountsCache;
  private cacheData: { 
    userCounts: UserDiamondCount[], 
    stats: DiamondCountStats, 
    timestamp: number 
  } | null = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new BulkDiamondCountsCache();
    }
    return this.instance;
  }

  isValid(): boolean {
    if (!this.cacheData) return false;
    
    const isRecent = (Date.now() - this.cacheData.timestamp) < CACHE_DURATION;
    
    // Validate cache data - check for obviously bad data (all same count)
    if (this.cacheData.userCounts.length > 5) {
      const counts = this.cacheData.userCounts
        .filter(u => u.diamond_count > 0)
        .map(u => u.diamond_count);
      
      // If all counts are exactly the same (like 737), it's likely bad cache
      if (counts.length > 3) {
        const allSame = counts.every(c => c === counts[0]);
        if (allSame) {
          console.warn('📊 CACHE: Detected potentially corrupted cache (all counts identical)');
          return false;
        }
      }
    }
    
    return isRecent;
  }

  get(): { userCounts: UserDiamondCount[], stats: DiamondCountStats } | null {
    if (this.isValid()) {
      return {
        userCounts: this.cacheData!.userCounts,
        stats: this.cacheData!.stats
      };
    }
    return null;
  }

  set(userCounts: UserDiamondCount[], stats: DiamondCountStats) {
    this.cacheData = {
      userCounts,
      stats,
      timestamp: Date.now()
    };
    
    try {
      const dataToStore = JSON.stringify({
        userCounts: userCounts.slice(0, 1000),
        stats,
        timestamp: Date.now()
      });
      localStorage.setItem(CACHE_KEY, dataToStore);
    } catch (error) {
      console.warn('Failed to store bulk cache in localStorage:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if ((Date.now() - parsed.timestamp) < CACHE_DURATION) {
          this.cacheData = parsed;
          return this.isValid(); // Double-check validity
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load bulk cache from localStorage:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return false;
  }

  clear() {
    this.cacheData = null;
    localStorage.removeItem(CACHE_KEY);
    // Also clear old cache keys
    localStorage.removeItem('bulk_user_diamond_counts');
    localStorage.removeItem('user_diamond_counts_cache');
    console.log('📊 CACHE: All caches cleared');
  }
}

const cache = BulkDiamondCountsCache.getInstance();

// Query diamond counts from Supabase inventory table (FastAPI syncs to this)
// NOTE: GET /api/v1/get_all_stones uses JWT auth - cannot query per-user without their token
async function fetchDiamondCountForUser(telegramId: number): Promise<{ count: number; status: 'connected' | 'no_data' | 'error'; timeMs: number }> {
  const startTime = Date.now();
  
  try {
    // Query Supabase inventory table which has user_id column
    const { data, error, count } = await supabase
      .from('inventory')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', telegramId)
      .is('deleted_at', null);
    
    const timeMs = Date.now() - startTime;
    
    if (error) {
      console.error(`❌ Supabase error for user ${telegramId}:`, error.message);
      return { count: 0, status: 'error', timeMs };
    }
    
    const diamondCount = count ?? 0;
    
    return { 
      count: diamondCount, 
      status: diamondCount > 0 ? 'connected' : 'no_data',
      timeMs
    };
  } catch (error) {
    const timeMs = Date.now() - startTime;
    console.error(`❌ Error fetching diamonds for user ${telegramId}:`, error);
    return { count: 0, status: 'error', timeMs };
  }
}

export function useBulkUserDiamondCounts() {
  const [userCounts, setUserCounts] = useState<UserDiamondCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [progress, setProgress] = useState<FetchProgress | null>(null);

  const stats = useMemo(() => {
    const totalUsers = userCounts.length;
    const usersWithDiamonds = userCounts.filter(u => u.diamond_count > 0).length;
    const usersWithZeroDiamonds = totalUsers - usersWithDiamonds;
    const totalDiamonds = userCounts.reduce((sum, u) => sum + u.diamond_count, 0);
    const avgDiamondsPerUser = totalUsers > 0 ? Math.round((totalDiamonds / totalUsers) * 10) / 10 : 0;
    const premiumUsers = userCounts.filter(u => u.is_premium).length;
    const fastapiConnectedUsers = userCounts.filter(u => u.fastapi_status === 'connected').length;

    return {
      totalUsers,
      usersWithDiamonds,
      usersWithZeroDiamonds,
      totalDiamonds,
      avgDiamondsPerUser,
      premiumUsers,
      fastapiConnectedUsers
    };
  }, [userCounts]);

  const fetchBulkDiamondCounts = useCallback(async (skipCache = false) => {
    try {
      setLoading(true);
      setProgress(null);
      console.log('📊 BULK: Starting diamond counts fetch...', { skipCache });

      // Check cache first (unless skipping)
      if (!skipCache) {
        const cachedData = cache.get();
        if (cachedData) {
          console.log('📊 BULK: Using cached data', cachedData.userCounts.length, 'users');
          setUserCounts(cachedData.userCounts);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }
      }

      console.log('📊 BULK: Fetching fresh data from Supabase and FastAPI...');

      // Get all users from Supabase
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at, status, is_premium, subscription_plan')
        .order('created_at', { ascending: false })
        .limit(2000);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      if (!allUsers || allUsers.length === 0) {
        console.log('📊 BULK: No users found');
        setUserCounts([]);
        setLoading(false);
        return;
      }

      console.log(`📊 BULK: Found ${allUsers.length} users, fetching diamond counts one-by-one...`);
      
      const totalUsers = allUsers.length;
      setProgress({ current: 0, total: totalUsers, percentage: 0 });

      // Process users in small batches for better progress feedback
      const BATCH_SIZE = 10;
      const userDiamondData: UserDiamondCount[] = [];
      let totalFetchTime = 0;
      
      for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
        const batch = allUsers.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i/BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(allUsers.length / BATCH_SIZE);
        
        console.log(`📊 BULK: Processing batch ${batchNumber}/${totalBatches}`);
        
        // Process batch concurrently
        const batchPromises = batch.map(async (user) => {
          const { count, status, timeMs } = await fetchDiamondCountForUser(user.telegram_id);
          totalFetchTime += timeMs;
          
          return {
            telegram_id: user.telegram_id,
            first_name: user.first_name || 'Unknown',
            last_name: user.last_name || '',
            username: user.username || '',
            created_at: user.created_at,
            diamond_count: count,
            status: user.status === 'active' ? 'active' : 'inactive',
            is_premium: user.is_premium || false,
            subscription_plan: user.subscription_plan || 'free',
            fastapi_status: status,
            fetch_time_ms: timeMs
          } as UserDiamondCount;
        });

        const batchResults = await Promise.all(batchPromises);
        userDiamondData.push(...batchResults);

        // Update progress
        const processed = Math.min(i + BATCH_SIZE, totalUsers);
        setProgress({
          current: processed,
          total: totalUsers,
          percentage: Math.round((processed / totalUsers) * 100),
          currentUser: batch[batch.length - 1]?.first_name
        });

        // Update UI progressively
        setUserCounts([...userDiamondData]);
        
        // Small delay between batches to prevent overwhelming the server
        if (i + BATCH_SIZE < allUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setLastUpdated(new Date());
      setProgress(null);
      
      // Calculate final stats
      const finalStats = {
        totalUsers: userDiamondData.length,
        usersWithDiamonds: userDiamondData.filter(u => u.diamond_count > 0).length,
        usersWithZeroDiamonds: userDiamondData.filter(u => u.diamond_count === 0).length,
        totalDiamonds: userDiamondData.reduce((sum, u) => sum + u.diamond_count, 0),
        avgDiamondsPerUser: userDiamondData.length > 0 
          ? Math.round((userDiamondData.reduce((sum, u) => sum + u.diamond_count, 0) / userDiamondData.length) * 10) / 10 
          : 0,
        premiumUsers: userDiamondData.filter(u => u.is_premium).length,
        fastapiConnectedUsers: userDiamondData.filter(u => u.fastapi_status === 'connected').length
      };
      
      // Cache the results
      cache.set(userDiamondData, finalStats);
      
      const avgFetchTime = Math.round(totalFetchTime / userDiamondData.length);
      console.log(`📊 BULK: Completed! ${finalStats.totalDiamonds} total diamonds, ${finalStats.fastapiConnectedUsers} connected users, avg fetch time: ${avgFetchTime}ms`);
      
      toast({
        title: "✅ Data Loaded",
        description: `${finalStats.totalDiamonds} diamonds from ${finalStats.fastapiConnectedUsers} users`
      });
      
    } catch (error) {
      console.error('❌ BULK: Error in fetchBulkDiamondCounts:', error);
      toast({
        variant: "destructive",
        title: "❌ Error Loading Diamond Counts",
        description: "Failed to load user diamond data. Please try again."
      });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, []);

  const forceRefresh = useCallback(() => {
    cache.clear();
    fetchBulkDiamondCounts(true);
  }, [fetchBulkDiamondCounts]);

  useEffect(() => {
    // Clear any potentially corrupted cache on mount
    cache.loadFromStorage();
    const cachedData = cache.get();
    
    if (cachedData) {
      setUserCounts(cachedData.userCounts);
      setLastUpdated(new Date());
      setLoading(false);
    }
    
    // Always fetch fresh data
    fetchBulkDiamondCounts(false);
  }, [fetchBulkDiamondCounts]);

  return {
    userCounts,
    stats,
    loading,
    lastUpdated,
    forceRefresh,
    progress,
    cacheInfo: {
      isValid: cache.isValid(),
      lastUpdated: lastUpdated,
      userCount: userCounts.length
    }
  };
}
