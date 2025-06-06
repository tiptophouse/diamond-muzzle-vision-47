
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

  const fetchBlockedUsers = async () => {
    try {
      // Set current user context for RLS
      if (user?.id && user.id !== getCurrentUserId()) {
        setCurrentUserId(user.id);
      }

      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast({
        title: "Error",
        description: "Failed to load blocked users",
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
      // Set current user context for RLS
      setCurrentUserId(user.id);

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          telegram_id: telegramId,
          blocked_by_telegram_id: user.id,
          reason: reason || 'No reason provided'
        });

      if (error) throw error;

      toast({
        title: "User Blocked",
        description: `User ${telegramId} has been blocked successfully`,
      });

      fetchBlockedUsers();
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
      return false;
    }
  };

  const unblockUser = async (blockedUserId: string) => {
    try {
      // Set current user context for RLS
      if (user?.id) {
        setCurrentUserId(user.id);
      }

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockedUserId);

      if (error) throw error;

      toast({
        title: "User Unblocked",
        description: "User has been unblocked successfully",
      });

      fetchBlockedUsers();
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
      return false;
    }
  };

  const isUserBlocked = (telegramId: number): boolean => {
    return blockedUsers.some(blocked => blocked.telegram_id === telegramId);
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
