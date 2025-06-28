
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { secureApiService } from '@/services/secureApiService';

export interface DiamondFormData {
  // Basic Info
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
  stockNumber?: string;
}

export function useAddDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { trackDiamondOperation } = useEnhancedUserTracking();

  const addDiamondMutation = useMutation({
    mutationFn: async (data: DiamondFormData): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const diamondData = {
        user_id: user.id,
        stock_number: data.stockNumber || `STK-${Date.now()}`,
        shape: data.shape,
        weight: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut || 'Excellent',
        price: data.price || 0,
        price_per_carat: data.carat > 0 ? Math.round((data.price || 0) / data.carat) : 0,
        status: 'Available',
        store_visible: data.storeVisible !== false,
        fluorescence: data.fluorescence || 'None',
        polish: data.polish || 'Excellent',
        symmetry: data.symmetry || 'Excellent',
        certificate_number: data.certificateNumber || '',
        certificate_url: '',
        lab: data.certificateType || 'GIA',
        length: data.length || 0,
        width: data.width || 0,
        depth: data.depth || 0,
        table_percentage: data.table || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('➕ ADD DIAMOND: Sending data to secure API:', diamondData);

      const result = await secureApiService.addStone(diamondData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add diamond');
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success ✅",
        description: "Diamond added successfully to your inventory!",
      });
      
      trackDiamondOperation('add', { success: true });
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('❌ ADD DIAMOND: Error:', error);
      toast({
        title: "Add Failed ❌",
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
