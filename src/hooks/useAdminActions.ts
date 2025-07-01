
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useAdminActions() {
  const queryClient = useQueryClient();

  const blockUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      const adminId = 2138564172; // Fixed admin ID
      
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          telegram_id: userId,
          blocked_by_telegram_id: adminId,
          reason: reason
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      toast({
        title: "Success ✅",
        description: "User has been blocked successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to block user:', error);
      toast({
        variant: "destructive",
        title: "Error ❌",
        description: "Failed to block user. Please try again.",
      });
    },
  });

  const unblockUser = useMutation({
    mutationFn: async (userId: number) => {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('telegram_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      toast({
        title: "Success ✅",
        description: "User has been unblocked successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to unblock user:', error);
      toast({
        variant: "destructive",
        title: "Error ❌",
        description: "Failed to unblock user. Please try again.",
      });
    },
  });

  return {
    blockUser: blockUser.mutate,
    unblockUser: unblockUser.mutate,
    isBlocking: blockUser.isPending,
    isUnblocking: unblockUser.isPending,
  };
}
