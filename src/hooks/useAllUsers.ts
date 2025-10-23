import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useAllUsers() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllUsers = async () => {
    try {
      console.log('🔍 Fetching ALL users from FastAPI...');
      
      // Get ALL users from FastAPI /api/v1/clients endpoint
      const response = await api.get(apiEndpoints.getAllClients());
      
      if (response.error) {
        throw new Error(response.error);
      }

      const clients = (response.data as any[]) || [];
      console.log(`✅ Successfully fetched ${clients.length} users from FastAPI`);

      // Transform FastAPI client data to match expected format
      const transformedUsers = clients.map((client: any) => ({
        id: client.id,
        telegram_id: client.telegram_id,
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        username: client.username || '',
        phone: client.phone || '',
        email: client.email || '',
        is_premium: client.is_premium || false,
        subscription_plan: client.subscription_plan || 'free',
        subscription_status: client.status || 'free',
        created_at: client.created_at,
        updated_at: client.updated_at,
        last_active: client.last_active || client.updated_at,
        status: client.status || 'active',
        // Set default values for analytics (FastAPI doesn't provide these)
        total_visits: 0,
        api_calls_count: 0,
        storage_used_mb: 0,
        cost_per_user: 0,
        revenue_per_user: 0,
        profit_loss: 0,
        lifetime_value: 0,
        total_time_spent: '00:00:00'
      }));

      console.log(`📈 Final transformed users count: ${transformedUsers.length}`);
      setAllUsers(transformedUsers);
    } catch (error: any) {
      console.error('❌ Error fetching all users from FastAPI:', error);
      toast({
        title: "Error",
        description: "Failed to load user data from FastAPI",
        variant: "destructive",
      });
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserEngagementScore = (user: any): number => {
    // Calculate engagement based on visits, API calls, and activity
    const visits = user.total_visits || 0;
    const apiCalls = user.api_calls_count || 0;
    const hasRecentActivity = user.last_active ? 
      (Date.now() - new Date(user.last_active).getTime()) < (7 * 24 * 60 * 60 * 1000) : false;
    
    let score = 0;
    
    // Visits contribution (0-40 points)
    score += Math.min(visits * 2, 40);
    
    // API calls contribution (0-40 points)
    score += Math.min(apiCalls, 40);
    
    // Recent activity bonus (0-20 points)
    if (hasRecentActivity) score += 20;
    
    return Math.min(score, 100);
  };

  const getUserStats = () => {
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => {
      const lastActive = u.last_active ? new Date(u.last_active) : null;
      return lastActive && (Date.now() - lastActive.getTime()) < (7 * 24 * 60 * 60 * 1000);
    }).length;
    
    const premiumUsers = allUsers.filter(u => u.is_premium || u.subscription_status === 'premium').length;
    const totalRevenue = allUsers.reduce((sum, u) => sum + (u.revenue_per_user || 0), 0);
    const totalCosts = allUsers.reduce((sum, u) => sum + (u.cost_per_user || 0), 0);

    return {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalRevenue,
      totalCosts,
      profit: totalRevenue - totalCosts
    };
  };

  const refetch = () => {
    setIsLoading(true);
    fetchAllUsers();
  };

  useEffect(() => {
    console.log('🚀 useAllUsers hook initialized, fetching users...');
    fetchAllUsers();
  }, []);

  return {
    allUsers,
    isLoading,
    getUserEngagementScore,
    getUserStats,
    refetch
  };
}
