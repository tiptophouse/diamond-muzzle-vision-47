
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface RealAdminStats {
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

interface RealUserData {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  subscription_status: 'free' | 'premium' | 'trial';
  is_premium: boolean;
  created_at: string;
  last_active?: string;
  total_visits: number;
  api_calls_count: number;
  status?: string; // Added this field to fix the TypeScript error
}

export function useRealAdminData() {
  const [stats, setStats] = useState<RealAdminStats | null>(null);
  const [users, setUsers] = useState<RealUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRealData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Admin: Fetching real data from FastAPI backend...');
      
      // Fetch all clients/users from FastAPI
      const usersResponse = await api.get<RealUserData[]>('/api/v1/clients');
      
      if (usersResponse.error) {
        throw new Error(usersResponse.error);
      }

      const realUsers = usersResponse.data || [];
      setUsers(realUsers);

      // Calculate real stats from actual data
      const activeUsers = realUsers.filter(user => {
        if (!user.last_active) return false;
        const lastActive = new Date(user.last_active);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastActive > weekAgo;
      }).length;

      const premiumUsers = realUsers.filter(user => user.is_premium || user.subscription_status === 'premium').length;
      const trialUsers = realUsers.filter(user => user.subscription_status === 'trial').length;
      
      // Try to fetch payment stats
      let paymentStats = { totalRevenue: 0, totalCosts: 0, profit: 0 };
      try {
        const paymentResponse = await api.get<any>('/api/v1/payments/stats');
        if (paymentResponse.data) {
          paymentStats = paymentResponse.data;
        }
      } catch (paymentError) {
        console.warn('Payment stats not available:', paymentError);
      }

      const realStats: RealAdminStats = {
        totalUsers: realUsers.length,
        activeUsers,
        premiumUsers,
        totalRevenue: paymentStats.totalRevenue,
        totalCosts: paymentStats.totalCosts,
        profit: paymentStats.profit,
        subscriptions: {
          active: premiumUsers,
          expired: realUsers.filter(user => user.subscription_status === 'free').length,
          trial: trialUsers,
        }
      };

      setStats(realStats);
      
      console.log('✅ Admin: Real data loaded successfully');
      console.log('📊 Real Stats:', realStats);
      console.log('👥 Real Users Count:', realUsers.length);

    } catch (error: any) {
      console.error('❌ Admin: Failed to fetch real data:', error);
      setError(error.message);
      
      toast({
        title: "Failed to Load Real Data",
        description: `Could not connect to FastAPI backend: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const getUserEngagementScore = (user: RealUserData): number => {
    // Calculate engagement based on real metrics
    const visitsScore = Math.min((user.total_visits || 0) * 2, 40);
    const apiCallsScore = Math.min((user.api_calls_count || 0) * 1, 30);
    const recentActivityScore = user.last_active ? 30 : 0;
    
    return Math.round(visitsScore + apiCallsScore + recentActivityScore);
  };

  return {
    stats,
    users,
    isLoading,
    error,
    refetch: fetchRealData,
    getUserEngagementScore,
  };
}
