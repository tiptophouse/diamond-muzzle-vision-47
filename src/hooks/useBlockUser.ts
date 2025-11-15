import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blockUser, unblockUser, getBlockedUsers, isUserBlocked, BlockUserParams } from '@/api/users';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useBlockUser() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();

  const blockMutation = useMutation({
    mutationFn: (params: Omit<BlockUserParams, 'blockedByTelegramId'>) => 
      blockUser({ ...params, blockedByTelegramId: user?.id || 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      toast({
        title: "✅ User Blocked",
        description: "The user has been blocked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Block Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      toast({
        title: "✅ User Unblocked",
        description: "The user has been unblocked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Unblock Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    blockUser: blockMutation.mutate,
    unblockUser: unblockMutation.mutate,
    isBlocking: blockMutation.isPending,
    isUnblocking: unblockMutation.isPending,
  };
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ['blocked-users'],
    queryFn: getBlockedUsers,
  });
}

export function useIsUserBlocked(telegramId?: number) {
  return useQuery({
    queryKey: ['user-blocked', telegramId],
    queryFn: () => telegramId ? isUserBlocked(telegramId) : Promise.resolve(false),
    enabled: !!telegramId,
  });
}
