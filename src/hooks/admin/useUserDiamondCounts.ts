
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { api, apiEndpoints } from '@/lib/api';
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
}

interface DiamondCountStats {
  totalUsers: number;
  usersWithDiamonds: number;
  usersWithZeroDiamonds: number;
  totalDiamonds: number;
  avgDiamondsPerUser: number;
}

export function useUserDiamondCounts() {
  const [userCounts, setUserCounts] = useState<UserDiamondCount[]>([]);
  const [stats, setStats] = useState<DiamondCountStats>({
    totalUsers: 0,
    usersWithDiamonds: 0,
    usersWithZeroDiamonds: 0,
    totalDiamonds: 0,
    avgDiamondsPerUser: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load from cache on component mount
  useEffect(() => {
    userDiamondCountsCache.loadFromLocalStorage();
    const cached = userDiamondCountsCache.getCachedData();
    
    if (cached) {
      setUserCounts(cached.userCounts);
      setStats(cached.stats);
      setLastUpdated(userDiamondCountsCache.getCacheInfo().lastUpdated);
      setLoading(false);
      
      toast({
        title: "📊 Cache Loaded",
        description: `Loaded ${cached.userCounts.length} users from cache`,
      });
    } else {
      // No valid cache, load fresh data
      loadUserDiamondCounts();
    }
  }, []);

  const loadUserDiamondCounts = useCallback(async (forceRefresh = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = userDiamondCountsCache.getCachedData();
      if (cached) {
        setUserCounts(cached.userCounts);
        setStats(cached.stats);
        setLastUpdated(userDiamondCountsCache.getCacheInfo().lastUpdated);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      console.log('📊 Loading fresh user diamond counts...');

      // Get all users from Supabase
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name, username, created_at, status')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw usersError;
      }

      console.log(`👥 Found ${users?.length || 0} users, fetching diamond counts...`);

      // For each user, get their actual diamond count from FastAPI
      const userDiamondCounts: UserDiamondCount[] = [];
      let processedCount = 0;
      
      for (const user of users || []) {
        try {
          console.log(`💎 Fetching diamonds for user ${user.telegram_id} (${++processedCount}/${users?.length || 0})...`);
          
          const response = await api.get(apiEndpoints.getAllStones(user.telegram_id));
          
          let diamondCount = 0;
          let lastUpload: string | undefined;
          
          if (response.data && Array.isArray(response.data)) {
            diamondCount = response.data.length;
            
            // Find the most recent diamond upload
            if (response.data.length > 0) {
              const sortedDiamonds = response.data.sort((a, b) => 
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
              );
              lastUpload = sortedDiamonds[0]?.created_at;
            }
          }

          userDiamondCounts.push({
            telegram_id: user.telegram_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            created_at: user.created_at,
            diamond_count: diamondCount,
            last_upload: lastUpload,
            status: (user.status === 'inactive') ? 'inactive' : 'active'
          });

          console.log(`✅ User ${user.telegram_id}: ${diamondCount} diamonds`);
        } catch (error) {
          console.error(`❌ Failed to fetch diamonds for user ${user.telegram_id}:`, error);
          
          // Add user with 0 diamonds if API fails
          userDiamondCounts.push({
            telegram_id: user.telegram_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            created_at: user.created_at,
            diamond_count: 0,
            status: (user.status === 'inactive') ? 'inactive' : 'active'
          });
        }
      }

      // Sort by diamond count (highest first)
      userDiamondCounts.sort((a, b) => b.diamond_count - a.diamond_count);

      // Calculate statistics
      const totalUsers = userDiamondCounts.length;
      const usersWithDiamonds = userDiamondCounts.filter(u => u.diamond_count > 0).length;
      const usersWithZeroDiamonds = userDiamondCounts.filter(u => u.diamond_count === 0).length;
      const totalDiamonds = userDiamondCounts.reduce((sum, u) => sum + u.diamond_count, 0);
      const avgDiamondsPerUser = totalUsers > 0 ? totalDiamonds / totalUsers : 0;

      const newStats = {
        totalUsers,
        usersWithDiamonds,
        usersWithZeroDiamonds,
        totalDiamonds,
        avgDiamondsPerUser: Math.round(avgDiamondsPerUser * 10) / 10
      };

      // Update cache
      userDiamondCountsCache.updateCache(userDiamondCounts, newStats);

      setUserCounts(userDiamondCounts);
      setStats(newStats);
      setLastUpdated(new Date());
      
      console.log('📊 User diamond counts loaded and cached:', {
        totalUsers,
        usersWithDiamonds,
        usersWithZeroDiamonds,
        totalDiamonds
      });

      toast({
        title: "✅ Diamond Counts Updated",
        description: `Loaded and cached diamond counts for ${totalUsers} users. Found ${totalDiamonds} total diamonds.`,
      });

    } catch (error) {
      console.error('❌ Error loading user diamond counts:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load user diamond counts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refreshing diamond counts...');
    userDiamondCountsCache.clearCache();
    loadUserDiamondCounts(true);
  }, [loadUserDiamondCounts]);

  const updateUserCount = useCallback((telegramId: number, newCount: number) => {
    userDiamondCountsCache.updateUserDiamondCount(telegramId, newCount);
    
    // Update local state
    setUserCounts(prev => prev.map(user => 
      user.telegram_id === telegramId 
        ? { ...user, diamond_count: newCount }
        : user
    ));
    
    // Recalculate stats
    const updatedCounts = userCounts.map(user => 
      user.telegram_id === telegramId 
        ? { ...user, diamond_count: newCount }
        : user
    );
    
    const totalUsers = updatedCounts.length;
    const usersWithDiamonds = updatedCounts.filter(u => u.diamond_count > 0).length;
    const usersWithZeroDiamonds = updatedCounts.filter(u => u.diamond_count === 0).length;
    const totalDiamonds = updatedCounts.reduce((sum, u) => sum + u.diamond_count, 0);
    const avgDiamondsPerUser = totalUsers > 0 ? totalDiamonds / totalUsers : 0;

    setStats({
      totalUsers,
      usersWithDiamonds,
      usersWithZeroDiamonds,
      totalDiamonds,
      avgDiamondsPerUser: Math.round(avgDiamondsPerUser * 10) / 10
    });
  }, [userCounts]);

  return {
    userCounts,
    stats,
    loading,
    lastUpdated,
    loadUserDiamondCounts,
    forceRefresh,
    updateUserCount,
    cacheInfo: userDiamondCountsCache.getCacheInfo()
  };
}
