
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/types/diamond';

export function useInventoryCrud() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (diamond: Diamond) => {
      const diamondId = diamond.diamondId || diamond.id;
      if (!diamondId) {
        throw new Error('Diamond ID is required for deletion');
      }

      console.log('🗑️ Deleting diamond:', diamondId);
      
      // Call FastAPI delete endpoint
      const response = await api.delete(`${apiEndpoints.deleteDiamond}/${diamondId}`);
      
      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onSuccess: (data, diamond) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: `${diamond.shape} ${diamond.carat}ct diamond deleted successfully`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete diamond",
        variant: "destructive",
      });
    },
  });

  return {
    deleteDiamond: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
