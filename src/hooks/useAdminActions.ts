
import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  blockedUsers: number;
}

export function useAdminActions(searchTerm?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();
  const { enhancedUsers, getUserEngagementScore, getUserStats } = useEnhancedAnalytics();

  // Filter users based on search term
  const filteredUsers = enhancedUsers.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.telegram_id?.toString().includes(searchLower)
    );
  });

  const stats = getUserStats();
  const blockedUsersCount = stats.totalUsers - stats.activeUsers; // Approximate
  const averageEngagement = enhancedUsers.length > 0 
    ? Math.round(enhancedUsers.reduce((sum, user) => sum + getUserEngagementScore(user), 0) / enhancedUsers.length)
    : 0;

  const blockUser = async (userId: number, reason: string) => {
    setIsLoading(true);
    try {
      console.log('🚫 Blocking user:', userId);
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
      return true;
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to block user",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unblockUser = async (userId: number) => {
    setIsLoading(true);
    try {
      console.log('✅ Unblocking user:', userId);
      const response = await api.delete(apiEndpoints.unblockUser(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "User Unblocked",
        description: `Successfully unblocked user ${userId}`,
      });
      return true;
    } catch (error) {
      console.error('❌ Error unblocking user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unblock user",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToUser = async (userId: number, message: string) => {
    setIsLoading(true);
    try {
      console.log('💬 Sending message to user:', userId);
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
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    // Refresh logic would go here
    console.log('Refreshing admin data...');
  };

  const handleBlockUser = async (user: any) => {
    return await blockUser(user.telegram_id, 'Blocked by admin');
  };

  const handleUnblockUser = async (user: any) => {
    return await unblockUser(user.telegram_id);
  };

  const handleDeleteUser = async (user: any) => {
    console.log('Delete user functionality not implemented yet');
    return false;
  };

  const handlePromoteUser = async (user: any) => {
    console.log('Promote user functionality not implemented yet');
    return false;
  };

  return {
    users: enhancedUsers,
    filteredUsers,
    blockedUsersCount,
    notifications,
    stats,
    averageEngagement,
    isLoading,
    error,
    getUserEngagementScore,
    refreshData,
    handleBlockUser,
    handleUnblockUser,
    handleDeleteUser,
    handlePromoteUser,
    blockUser,
    unblockUser,
    sendMessageToUser,
  };
}
