
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Diamond } from '@/types/diamond';
import { fetchApi } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import { getCurrentUserId } from '@/lib/api/config';

export function useDeleteDiamond() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diamond: Diamond) => {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const diamondId = diamond.diamondId || diamond.id;
      console.log('🗑️ Deleting diamond:', { diamondId, userId });

      const response = await fetchApi(
        apiEndpoints.deleteDiamond(diamondId, userId),
        {
          method: 'DELETE',
        }
      );

      console.log('✅ Delete response:', response);
      return response;
    },
    onSuccess: (_, diamond) => {
      // Invalidate and refetch inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stones'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Show success toast
      toast({
        title: "💎 Stone Deleted Successfully",
        description: `${diamond.shape} ${diamond.carat}ct has been removed from your inventory`,
      });

      console.log('✅ Diamond deleted successfully:', diamond.diamondId || diamond.id);
    },
    onError: (error: any) => {
      console.error('❌ Delete diamond error:', error);
      
      toast({
        title: "❌ Failed to Delete Stone",
        description: error.message || "An error occurred while deleting the stone",
        variant: "destructive",
      });
    },
  });
}
