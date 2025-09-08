// Optimized Diamond Addition Hook with Telegram Integration
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTelegramHaptics } from '@/hooks/useTelegramSDK';
import type { Database } from '@/integrations/supabase/types';

type DiamondInsert = Database['public']['Tables']['diamonds']['Insert'];

export function useAddDiamond() {
  const queryClient = useQueryClient();
  const { notification, isAvailable } = useTelegramHaptics();

  return useMutation({
    mutationFn: async (diamondData: DiamondInsert) => {
      const { data, error } = await supabase
        .from('diamonds')
        .insert(diamondData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (newDiamond) => {
      // Haptic feedback for successful addition
      if (isAvailable) {
        notification('success');
      }

      // Update all relevant queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      queryClient.invalidateQueries({ queryKey: ['store-diamonds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });

      // Add the new diamond to cache
      queryClient.setQueryData(['diamond', newDiamond.id], newDiamond);

      toast.success('Diamond added successfully', {
        description: `Diamond (${newDiamond.carat}ct) added to your inventory.`,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to diamond detail if needed
            window.location.href = `/diamond/${newDiamond.id}`;
          }
        }
      });
    },
    onError: (error) => {
      // Haptic feedback for error
      if (isAvailable) {
        notification('error');
      }

      console.error('Failed to add diamond:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add diamond to inventory';
      
      toast.error('Failed to add diamond', {
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