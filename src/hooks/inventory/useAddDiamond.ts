
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { HybridDiamondService } from '@/services/hybridDiamondService';

export interface DiamondFormData {
  // Basic Info
  stockNumber?: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut?: string;
  
  // Measurements
  length?: number;
  width?: number;
  depth?: number;
  table?: number;
  
  // Certificate
  certificateNumber?: string;
  certificateUrl?: string;
  certificateType?: string;
  
  // Pricing
  price?: number;
  
  // Images
  images?: string[];
  
  // Store visibility
  storeVisible?: boolean;
  
  // Additional properties
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  girdle?: string;
  culet?: string;
}

export function useAddDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { trackDiamondOperation } = useEnhancedUserTracking();
  const { triggerInventoryChange } = useInventoryDataSync();
  const hybridService = new HybridDiamondService();

  const addDiamondMutation = useMutation({
    mutationFn: async (data: DiamondFormData): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const diamondData = {
        stock_number: data.stockNumber || `STOCK-${Date.now()}`,
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

      console.log('➕ ADD: Adding diamond with hybrid service:', diamondData);
      return await hybridService.addDiamond(diamondData);
    },
    onSuccess: () => {
      toast({
        title: "✅ Success",
        description: "Diamond added successfully to your inventory!",
      });
      
      trackDiamondOperation('add', { success: true });
      triggerInventoryChange();
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('➕ ADD: Error adding diamond:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add diamond. Please try again.",
        variant: "destructive",
      });
      
      trackDiamondOperation('add', { success: false, error: error.message });
    },
  });

  return {
    addDiamond: addDiamondMutation.mutateAsync,
    isLoading: addDiamondMutation.isPending,
  };
}
