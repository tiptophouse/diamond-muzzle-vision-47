
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';
import { useRealAdminData } from './useRealAdminData';

interface AdminUser {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  subscription_status: 'free' | 'premium' | 'trial';
  subscription_plan?: string;
  is_premium: boolean;
  created_at: string;
  last_active?: string;
  last_login?: string;
  total_visits: number;
  api_calls_count: number;
  photo_url?: string;
  status: string;
  payment_status?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  subscriptions: {
    active: number;
    expired: number;
    trial: number;
  };
}

export function useAdminData() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'fastapi' | 'supabase'>('fastapi');
  const { toast } = useToast();

  // Try FastAPI first
  const { users: fastapiUsers, stats: fastapiStats, isLoading: fastapiLoading, error: fastapiError } = useRealAdminData();
  
  // Fallback to Supabase
  const { enhancedUsers, isLoading: supabaseLoading, getUserStats, refetch: refetchSupabase } = useEnhancedAnalytics();

  useEffect(() => {
    console.log('🔍 Admin Data: Determining data source...');
    console.log('🔍 FastAPI Loading:', fastapiLoading, 'Error:', fastapiError);
    console.log('🔍 Supabase Loading:', supabaseLoading, 'Users:', enhancedUsers.length);

    if (!fastapiLoading && !supabaseLoading) {
      if (fastapiError || !fastapiUsers || fastapiUsers.length === 0) {
        // Use Supabase data as fallback
        console.log('🔄 Admin Data: Using Supabase as fallback data source');
        setDataSource('supabase');
        
        const transformedUsers: AdminUser[] = enhancedUsers.map(user => ({
          id: user.id,
          telegram_id: user.telegram_id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          phone_number: user.phone_number,
          subscription_status: (user.subscription_status as 'free' | 'premium' | 'trial') || 'free',
          subscription_plan: user.subscription_plan,
          is_premium: user.is_premium || false,
          created_at: user.created_at,
          last_active: user.last_active,
          last_login: user.last_login,
          total_visits: user.total_visits || 0,
          api_calls_count: user.api_calls_count || 0,
          photo_url: user.photo_url,
          status: user.status || 'active',
          payment_status: user.payment_status || 'none'
        }));

        setUsers(transformedUsers);

        // Calculate stats from Supabase data
        const supabaseStats = getUserStats();
        const adminStats: AdminStats = {
          totalUsers: supabaseStats.totalUsers,
          activeUsers: supabaseStats.activeUsers,
          premiumUsers: supabaseStats.premiumUsers,
          totalRevenue: supabaseStats.totalRevenue,
          totalCosts: supabaseStats.totalCosts,
          profit: supabaseStats.profit,
          subscriptions: {
            active: transformedUsers.filter(u => u.is_premium || u.subscription_status === 'premium').length,
            expired: transformedUsers.filter(u => u.subscription_status === 'free').length,
            trial: transformedUsers.filter(u => u.subscription_status === 'trial').length,
          }
        };

        setStats(adminStats);
        setError(null);

        toast({
          title: "Admin Data Loaded",
          description: `Using Supabase data: ${transformedUsers.length} users loaded`,
        });
      } else {
        // Use FastAPI data
        console.log('✅ Admin Data: Using FastAPI as primary data source');
        setDataSource('fastapi');
        setUsers(fastapiUsers);
        setStats(fastapiStats);
        setError(null);
      }
      
      setIsLoading(false);
    }
  }, [fastapiLoading, supabaseLoading, fastapiError, fastapiUsers, fastapiStats, enhancedUsers, getUserStats, toast]);

  const getUserEngagementScore = (user: AdminUser): number => {
    const visitsScore = Math.min((user.total_visits || 0) * 2, 40);
    const apiCallsScore = Math.min((user.api_calls_count || 0) * 1, 30);
    const recentActivityScore = user.last_active ? 30 : 0;
    
    return Math.round(visitsScore + apiCallsScore + recentActivityScore);
  };

  const refetch = () => {
    if (dataSource === 'supabase') {
      refetchSupabase();
    }
    // FastAPI refetch is handled by useRealAdminData
  };

  return {
    users,
    stats,
    isLoading,
    error,
    dataSource,
    refetch,
    getUserEngagementScore,
  };
}
