
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
      console.warn('⚠️ fetchBlockedUsers: No user ID available');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📋 Fetching blocked users via edge function for admin:', user.id);
      const { data, error } = await supabase.functions.invoke('admin-manage-blocked-users', {
        body: {
          action: 'list',
          admin_telegram_id: user.id
        }
      });

      console.log('📋 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        // Check if it's a permissions error
        if (error.message?.includes('Unauthorized') || error.message?.includes('403')) {
          toast({
            title: "Access Denied",
            description: "You don't have admin permissions to view blocked users",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      
      if (!data) {
        console.warn('⚠️ No data returned from edge function');
        setBlockedUsers([]);
        return;
      }

      if (!data.success) {
        const errorMsg = data.error || 'Failed to fetch blocked users';
        console.error('❌ Edge function returned error:', errorMsg);
        
        // Handle specific error messages
        if (errorMsg.includes('Unauthorized') || errorMsg.includes('Admin access required')) {
          toast({
            title: "Admin Access Required",
            description: "You need admin permissions to manage blocked users",
            variant: "destructive",
          });
        } else {
          throw new Error(errorMsg);
        }
        return;
      }
      
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

    // Validate telegram ID
    if (!telegramId || isNaN(telegramId) || telegramId <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid Telegram ID",
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

      console.log('🚫 Block user response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        if (error.message?.includes('Unauthorized') || error.message?.includes('403')) {
          toast({
            title: "Access Denied",
            description: "You don't have admin permissions to block users",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }
      
      if (!data?.success) {
        const errorMsg = data?.error || 'Failed to block user';
        console.error('❌ Block user failed:', errorMsg);
        
        if (errorMsg.includes('duplicate') || errorMsg.includes('already')) {
          toast({
            title: "Already Blocked",
            description: `User ${telegramId} is already blocked`,
            variant: "default",
          });
          return false;
        }
        
        throw new Error(errorMsg);
      }

      toast({
        title: "✅ User Blocked",
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

    if (!blockedUserId) {
      toast({
        title: "Error",
        description: "Invalid blocked user ID",
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

      console.log('✅ Unblock user response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        if (error.message?.includes('Unauthorized') || error.message?.includes('403')) {
          toast({
            title: "Access Denied",
            description: "You don't have admin permissions to unblock users",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }
      
      if (!data?.success) {
        const errorMsg = data?.error || 'Failed to unblock user';
        console.error('❌ Unblock user failed:', errorMsg);
        throw new Error(errorMsg);
      }

      toast({
        title: "✅ User Unblocked",
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
    const init = async () => {
      if (user?.id) {
        try {
          await setUserContext();
        } catch (e) {
          console.warn('⚠️ Failed to set session context:', e);
        }
        await fetchBlockedUsers();
      } else {
        setIsLoading(false);
      }
    };
    init();
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
