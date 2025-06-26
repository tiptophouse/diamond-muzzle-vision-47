
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { HybridDiamondService } from '@/services/hybridDiamondService';

interface DiamondFormData {
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut?: string;
  price?: number;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  certificateUrl?: string;
  certificateNumber?: string;
  storeVisible?: boolean;
}

export function useUpdateDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { triggerInventoryChange } = useInventoryDataSync();
  const hybridService = new HybridDiamondService();

  const updateDiamondMutation = useMutation({
    mutationFn: async ({ diamondId, data }: { diamondId: string; data: DiamondFormData }): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const diamondData = {
        shape: data.shape,
        weight: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: data.price || 0,
        polish: data.polish,
        symmetry: data.symmetry,
        fluorescence: data.fluorescence,
        certificate_url: data.certificateUrl,
        certificate_number: data.certificateNumber,
        store_visible: data.storeVisible !== false
      };

      console.log('📝 UPDATE: Updating diamond with hybrid service:', diamondId);
      return await hybridService.updateDiamond(diamondId, diamondData);
    },
    onSuccess: () => {
      toast({
        title: "✅ Success",
        description: "Diamond updated successfully!",
      });
      
      triggerInventoryChange();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('📝 UPDATE: Error updating diamond:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update diamond. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    updateDiamond: updateDiamondMutation.mutateAsync,
    isLoading: updateDiamondMutation.isPending,
  };
}
