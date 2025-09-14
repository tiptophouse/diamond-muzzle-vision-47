
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
import { userDiamondCountsCache } from '@/services/userDiamondCountsCache';

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

export function useUserDiamondCounts() {
  const [userCounts, setUserCounts] = useState<UserDiamondCount[]>([]);
  const [stats, setStats] = useState<DiamondCountStats>({
    totalUsers: 0,
    usersWithDiamonds: 0,
    usersWithZeroDiamonds: 0,
    totalDiamonds: 0,
    avgDiamondsPerUser: 0,
    premiumUsers: 0,
    fastapiConnectedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cacheInfo, setCacheInfo] = useState({ isValid: false, lastUpdated: null, userCount: 0 });

  const fetchUserDiamondCounts = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching all user diamond counts...');

      // Check cache first
      const cachedData = userDiamondCountsCache.getCachedData();
      if (cachedData) {
        console.log('📊 Using cached data');
        setUserCounts(cachedData.userCounts.map(u => ({
          ...u,
          is_premium: false,
          subscription_plan: 'free',
          fastapi_status: u.diamond_count > 0 ? 'connected' as const : 'no_data' as const
        })));
        setStats({
          ...cachedData.stats,
          premiumUsers: cachedData.stats.premiumUsers || 0,
          fastapiConnectedUsers: cachedData.stats.fastapiConnectedUsers || 0
        });
        setLastUpdated(userDiamondCountsCache.getCacheInfo().lastUpdated);
        setLoading(false);
        return;
      }

      // Get all users from Supabase
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at, status, is_premium, subscription_plan')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log(`📊 Found ${allUsers?.length || 0} total users in Supabase`);

      // Process users in batches for better performance
      const BATCH_SIZE = 10;
      const userDiamondData: UserDiamondCount[] = [];
      let totalDiamonds = 0;
      let usersWithDiamonds = 0;
      let fastapiConnectedUsers = 0;

      for (let i = 0; i < (allUsers || []).length; i += BATCH_SIZE) {
        const batch = (allUsers || []).slice(i, i + BATCH_SIZE);
        console.log(`📊 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil((allUsers || []).length / BATCH_SIZE)}`);
        
        // Process batch concurrently
        const batchPromises = batch.map(async (user) => {
          try {
            const response = await api.get(`/api/v1/get_all_stones?user_id=${user.telegram_id}`);
            
            let diamondCount = 0;
            let fastapiStatus: 'connected' | 'no_data' | 'error' = 'no_data';
            
            if (response.data && Array.isArray(response.data)) {
              diamondCount = response.data.length;
              fastapiStatus = diamondCount > 0 ? 'connected' : 'no_data';
            }

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
              fastapi_status: fastapiStatus
            } as UserDiamondCount;

          } catch (error) {
            console.error(`❌ Error fetching diamonds for user ${user.telegram_id}:`, error);
            
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
              fastapi_status: 'error'
            } as UserDiamondCount;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        userDiamondData.push(...batchResults);

        // Calculate stats for this batch
        batchResults.forEach(user => {
          totalDiamonds += user.diamond_count;
          if (user.diamond_count > 0) {
            usersWithDiamonds++;
            fastapiConnectedUsers++;
          }
        });

        // Update UI progressively
        setUserCounts([...userDiamondData]);
      }

      // Calculate final stats
      const totalUsers = userDiamondData.length;
      const usersWithZeroDiamonds = totalUsers - usersWithDiamonds;
      const avgDiamondsPerUser = totalUsers > 0 ? Math.round((totalDiamonds / totalUsers) * 10) / 10 : 0;
      const premiumUsers = userDiamondData.filter(u => u.is_premium).length;

      const finalStats: DiamondCountStats = {
        totalUsers,
        usersWithDiamonds,
        usersWithZeroDiamonds,
        totalDiamonds,
        avgDiamondsPerUser,
        premiumUsers,
        fastapiConnectedUsers
      };

      setUserCounts(userDiamondData);
      setStats(finalStats);
      setLastUpdated(new Date());

      // Update cache
      userDiamondCountsCache.updateCache(
        userDiamondData.map(u => ({ ...u, cached_at: new Date().toISOString() })),
        finalStats
      );

      console.log('📊 Final Stats:', finalStats);
      console.log(`📊 Total Users: ${totalUsers} (${premiumUsers} premium, ${fastapiConnectedUsers} with FastAPI data)`);

    } catch (error) {
      console.error('❌ Error in fetchUserDiamondCounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    userDiamondCountsCache.clearCache();
    fetchUserDiamondCounts();
  };

  useEffect(() => {
    // Load from localStorage first, then fetch if needed
    userDiamondCountsCache.loadFromLocalStorage();
    fetchUserDiamondCounts();
  }, []);

  useEffect(() => {
    setCacheInfo(userDiamondCountsCache.getCacheInfo());
  }, [userCounts]);

  return {
    userCounts,
    stats,
    loading,
    lastUpdated,
    forceRefresh,
    cacheInfo
  };
}
