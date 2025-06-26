
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { HybridDiamondService } from '@/services/hybridDiamondService';

export function useDeleteDiamond() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { triggerInventoryChange } = useInventoryDataSync();
  const hybridService = new HybridDiamondService();

  const deleteDiamondMutation = useMutation({
    mutationFn: async (stoneId: string): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🗑️ DELETE: Deleting diamond with hybrid service:', stoneId);
      return await hybridService.deleteDiamond(stoneId);
    },
    onSuccess: () => {
      toast({
        title: "✅ Success",
        description: "Stone deleted successfully from your inventory!",
      });
      
      triggerInventoryChange();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
    },
    onError: (error: Error) => {
      console.error('🗑️ DELETE: Error deleting stone:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete stone. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    deleteDiamond: deleteDiamondMutation.mutateAsync,
    isDeleting: deleteDiamondMutation.isPending,
  };
}
