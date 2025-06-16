
import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface AdminUser {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name: string;
  username?: string;
  phone?: string;
  email?: string;
  status: string;
  subscription_status: string;
  is_premium: boolean;
  last_active?: string;
  created_at: string;
  total_visits: number;
  api_calls_count: number;
  storage_used_mb: number;
  cost_per_user: number;
  revenue_per_user: number;
  profit_loss: number;
  lifetime_value: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchAdminUsers = async () => {
    if (!user?.id) return;
    
    try {
      console.log('👥 Fetching all users from FastAPI for admin...');
      const response = await api.get(apiEndpoints.getAllClients());
      
      if (response.error) {
        throw new Error(response.error);
      }

      const clientsData = response.data as AdminUser[];
      console.log('✅ Fetched users from FastAPI:', clientsData.length);
      setUsers(clientsData);

      // Calculate stats from the data
      const totalUsers = clientsData.length;
      const activeUsers = clientsData.filter(u => {
        const lastActive = u.last_active ? new Date(u.last_active) : null;
        return lastActive && (Date.now() - lastActive.getTime()) < (7 * 24 * 60 * 60 * 1000);
      }).length;
      
      const premiumUsers = clientsData.filter(u => u.is_premium || u.subscription_status === 'premium').length;
      const totalRevenue = clientsData.reduce((sum, u) => sum + (u.revenue_per_user || 0), 0);
      const totalCosts = clientsData.reduce((sum, u) => sum + (u.cost_per_user || 0), 0);

      setStats({
        totalUsers,
        activeUsers,
        premiumUsers,
        totalRevenue,
        totalCosts,
        profit: totalRevenue - totalCosts
      });

    } catch (error) {
      console.error('❌ Error fetching admin users:', error);
      toast({
        title: "Error loading users",
        description: "Unable to fetch user data from FastAPI server",
        variant: "destructive",
      });
      setUsers([]);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        totalRevenue: 0,
        totalCosts: 0,
        profit: 0
      });
    }
  };

  const blockUser = async (userId: number, reason: string) => {
    try {
      console.log('🚫 Blocking user via FastAPI:', userId);
      const response = await api.post(apiEndpoints.blockUser(), {
        user_id: userId,
        reason: reason
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "User Blocked",
        description: `Successfully blocked user ${userId}`,
      });
      
      // Refresh users list
      await fetchAdminUsers();
      return true;
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to block user",
        variant: "destructive",
      });
      return false;
    }
  };

  const unblockUser = async (userId: number) => {
    try {
      console.log('✅ Unblocking user via FastAPI:', userId);
      const response = await api.delete(apiEndpoints.unblockUser(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "User Unblocked",
        description: `Successfully unblocked user ${userId}`,
      });
      
      // Refresh users list
      await fetchAdminUsers();
      return true;
    } catch (error) {
      console.error('❌ Error unblocking user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unblock user",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendMessageToUser = async (userId: number, message: string) => {
    try {
      console.log('💬 Sending message to user via FastAPI:', userId);
      const response = await api.post(apiEndpoints.sendMessageToUser(), {
        user_id: userId,
        message: message
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Message Sent",
        description: `Successfully sent message to user ${userId}`,
      });
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeUserPayments = async (userId: number) => {
    try {
      console.log('💳 Removing payments for user via FastAPI:', userId);
      const response = await api.delete(apiEndpoints.removeUserPayments(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Payments Removed",
        description: `Successfully removed payments for user ${userId}`,
      });
      
      // Refresh users list
      await fetchAdminUsers();
      return true;
    } catch (error) {
      console.error('❌ Error removing user payments:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove payments",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUserEngagementScore = (user: AdminUser): number => {
    const visits = user.total_visits || 0;
    const apiCalls = user.api_calls_count || 0;
    const hasRecentActivity = user.last_active ? 
      (Date.now() - new Date(user.last_active).getTime()) < (7 * 24 * 60 * 60 * 1000) : false;
    
    let score = 0;
    score += Math.min(visits * 2, 40);
    score += Math.min(apiCalls, 40);
    if (hasRecentActivity) score += 20;
    
    return Math.min(score, 100);
  };

  const refetch = async () => {
    setIsLoading(true);
    await fetchAdminUsers();
    setIsLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAdminUsers();
      setIsLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  return {
    users,
    stats,
    isLoading,
    blockUser,
    unblockUser,
    sendMessageToUser,
    removeUserPayments,
    getUserEngagementScore,
    refetch,
  };
}
