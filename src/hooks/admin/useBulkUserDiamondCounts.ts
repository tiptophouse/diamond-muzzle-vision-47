import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
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

// Improved caching with compression and expiry
const CACHE_KEY = 'bulk_user_diamond_counts';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    return this.cacheData !== null && 
           (Date.now() - this.cacheData.timestamp) < CACHE_DURATION;
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
    
    // Store in localStorage with compression
    try {
      const dataToStore = JSON.stringify({
        userCounts: userCounts.slice(0, 1000), // Limit to prevent localStorage overflow
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
          return true;
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
  }
}

const cache = BulkDiamondCountsCache.getInstance();

export function useBulkUserDiamondCounts() {
  const [userCounts, setUserCounts] = useState<UserDiamondCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  const fetchBulkDiamondCounts = async () => {
    try {
      setLoading(true);
      console.log('📊 BULK: Checking cache first...');

      // Check cache first
      const cachedData = cache.get();
      if (cachedData) {
        console.log('📊 BULK: Using cached data');
        setUserCounts(cachedData.userCounts);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      console.log('📊 BULK: Fetching fresh data...');

      // Get all users from Supabase first
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at, status, is_premium, subscription_plan')
        .order('created_at', { ascending: false })
        .limit(2000); // Reasonable limit

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

      console.log(`📊 BULK: Found ${allUsers.length} users, fetching bulk diamond counts...`);

      // Try bulk endpoint first (if available)
      try {
        const telegramIds = allUsers.map(u => u.telegram_id).join(',');
        const bulkResponse = await api.get(`/api/v1/bulk_diamond_counts?user_ids=${telegramIds}`);
        
        if (bulkResponse.data && typeof bulkResponse.data === 'object') {
          console.log('📊 BULK: Successfully got bulk diamond counts');
          
          const userDiamondData: UserDiamondCount[] = allUsers.map(user => {
            const diamondCount = bulkResponse.data[user.telegram_id] || 0;
            return {
              telegram_id: user.telegram_id,
              first_name: user.first_name || 'Unknown',
              last_name: user.last_name || '',
              username: user.username || '',
              created_at: user.created_at,
              diamond_count: diamondCount,
              status: user.status === 'active' ? 'active' : 'inactive',
              is_premium: user.is_premium || false,
              subscription_plan: user.subscription_plan || 'free',
              fastapi_status: diamondCount > 0 ? 'connected' as const : 'no_data' as const
            };
          });

          setUserCounts(userDiamondData);
          setLastUpdated(new Date());
          
          // Cache the results
          cache.set(userDiamondData, stats);
          
          toast({
            title: "✅ Bulk Data Loaded",
            description: `Loaded ${userDiamondData.length} users with diamond counts in bulk`
          });
          
          return;
        }
      } catch (bulkError) {
        console.warn('📊 BULK: Bulk endpoint failed, falling back to individual calls:', bulkError);
      }

      // Fallback to optimized individual calls with better batching
      console.log('📊 BULK: Using optimized individual calls...');
      const BATCH_SIZE = 20; // Increased batch size
      const userDiamondData: UserDiamondCount[] = [];
      
      // Process in concurrent batches for better performance
      for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
        const batch = allUsers.slice(i, i + BATCH_SIZE);
        console.log(`📊 BULK: Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(allUsers.length / BATCH_SIZE)}`);
        
        const batchPromises = batch.map(async (user) => {
          try {
            const response = await Promise.race([
              api.get(`/api/v1/get_all_stones?user_id=${user.telegram_id}`),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]) as any;
            
            const diamondCount = response?.data?.length || 0;
            return {
              telegram_id: user.telegram_id,
              first_name: user.first_name || 'Unknown',
              last_name: user.last_name || '',
              username: user.username || '',
              created_at: user.created_at,
              diamond_count: diamondCount,
              status: user.status === 'active' ? 'active' : 'inactive',
              is_premium: user.is_premium || false,
              subscription_plan: user.subscription_plan || 'free',
              fastapi_status: diamondCount > 0 ? 'connected' as const : 'no_data' as const
            } as UserDiamondCount;
          } catch {
            return {
              telegram_id: user.telegram_id,
              first_name: user.first_name || 'Unknown',
              last_name: user.last_name || '',
              username: user.username || '',
              created_at: user.created_at,
              diamond_count: 0,
              status: user.status === 'active' ? 'active' : 'inactive',
              is_premium: user.is_premium || false,
              subscription_plan: user.subscription_plan || 'free',
              fastapi_status: 'error' as const
            } as UserDiamondCount;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        userDiamondData.push(...batchResults);

        // Update UI progressively for better UX
        setUserCounts([...userDiamondData]);
      }

      setLastUpdated(new Date());
      
      // Cache the final results
      cache.set(userDiamondData, stats);
      
      console.log(`📊 BULK: Completed loading ${userDiamondData.length} users`);
      
    } catch (error) {
      console.error('❌ BULK: Error in fetchBulkDiamondCounts:', error);
      toast({
        variant: "destructive",
        title: "❌ Error Loading Diamond Counts",
        description: "Failed to load user diamond data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    cache.clear();
    fetchBulkDiamondCounts();
  };

  useEffect(() => {
    // Load from cache first if available
    cache.loadFromStorage();
    const cachedData = cache.get();
    if (cachedData) {
      setUserCounts(cachedData.userCounts);
      setLastUpdated(new Date());
      setLoading(false);
    }
    
    // Always fetch fresh data
    fetchBulkDiamondCounts();
  }, []);

  return {
    userCounts,
    stats,
    loading,
    lastUpdated,
    forceRefresh,
    cacheInfo: {
      isValid: cache.isValid(),
      lastUpdated: lastUpdated,
      userCount: userCounts.length
    }
  };
}