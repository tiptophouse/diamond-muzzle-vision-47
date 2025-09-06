// Optimized Diamond Deletion Hook with Telegram Integration
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTelegramHaptics } from '@/hooks/useTelegramSDK';

export function useDeleteDiamond() {
  const queryClient = useQueryClient();
  const { notification, isAvailable } = useTelegramHaptics();

  return useMutation({
    mutationFn: async (diamondId: string) => {
      const { error } = await supabase
        .from('diamonds')
        .delete()
        .eq('id', diamondId);

      if (error) {
        throw error;
      }

      return diamondId;
    },
    onSuccess: (deletedId) => {
      // Haptic feedback for successful deletion
      if (isAvailable) {
        notification('success');
      }

      // Update all relevant queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      queryClient.invalidateQueries({ queryKey: ['store-diamonds'] });
      
      // Remove the specific diamond from cache
      queryClient.removeQueries({ queryKey: ['diamond', deletedId] });

      toast.success('Diamond deleted successfully', {
        description: 'The diamond has been removed from your inventory.'
      });
    },
    onError: (error) => {
      // Haptic feedback for error
      if (isAvailable) {
        notification('error');
      }

      console.error('Failed to delete diamond:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete diamond';
      
      toast.error('Failed to delete diamond', {
        description: errorMessage,
        action: {
          label: 'Try again',
          onClick: () => {
            // Could retry the mutation here if needed
          }
        }
      });
    }
  });
}