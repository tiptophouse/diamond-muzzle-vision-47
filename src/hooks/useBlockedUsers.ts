
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { setCurrentUserId, getCurrentUserId } from '@/lib/api';

interface BlockedUser {
  id: string;
  telegram_id: number;
  blocked_by_telegram_id: number;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export function useBlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const setUserContext = async () => {
    if (user?.id && user.id !== getCurrentUserId()) {
      setCurrentUserId(user.id);
      
      // Set database context via edge function
      await supabase.functions.invoke('set-session-context', {
        body: {
          setting_name: 'app.current_user_id',
          setting_value: user.id.toString()
        }
      });
    }
  };

  const fetchBlockedUsers = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('📋 Fetching blocked users via edge function...');
      const { data, error } = await supabase.functions.invoke('admin-manage-blocked-users', {
        body: {
          action: 'list',
          admin_telegram_id: user.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch blocked users');
      
      setBlockedUsers(data.data || []);
      console.log('✅ Fetched blocked users:', data.data?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching blocked users:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load blocked users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (telegramId: number, reason?: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to block users",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('🚫 Blocking user:', telegramId, 'by admin:', user.id);
      const { data, error } = await supabase.functions.invoke('admin-manage-blocked-users', {
        body: {
          action: 'block',
          telegram_id: telegramId,
          reason: reason || 'No reason provided',
          admin_telegram_id: user.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to block user');

      toast({
        title: "User Blocked",
        description: `User ${telegramId} has been blocked successfully`,
      });

      fetchBlockedUsers();
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

  const unblockUser = async (blockedUserId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to unblock users",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('✅ Unblocking user:', blockedUserId, 'by admin:', user.id);
      const { data, error } = await supabase.functions.invoke('admin-manage-blocked-users', {
        body: {
          action: 'unblock',
          blocked_user_id: blockedUserId,
          admin_telegram_id: user.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to unblock user');

      toast({
        title: "User Unblocked",
        description: "User has been unblocked successfully",
      });

      fetchBlockedUsers();
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

  const isUserBlocked = (telegramId: number): boolean => {
    const blocked = blockedUsers.some(blocked => blocked.telegram_id === telegramId);
    if (blocked) {
      console.log('🚫 User is blocked:', telegramId);
    }
    return blocked;
  };

  useEffect(() => {
    if (user?.id) {
      fetchBlockedUsers();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    blockedUsers,
    isLoading,
    blockUser,
    unblockUser,
    isUserBlocked,
    refetch: fetchBlockedUsers,
  };
}
