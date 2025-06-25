
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';

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
        shape: data.shape,
        carat: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        length: data.length,
        width: data.width,
        depth: data.depth,
        table_percentage: data.table,
        certificate_number: data.certificateNumber,
        certificate_type: data.certificateType,
        price: data.price,
        images: data.images || [],
        store_visible: data.storeVisible || false,
        fluorescence: data.fluorescence,
        polish: data.polish,
        symmetry: data.symmetry,
        girdle: data.girdle,
        culet: data.culet,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch('https://mazalbot.me/api/diamonds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diamondData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add diamond');
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
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
      console.error('Error adding diamond:', error);
      toast({
        title: "Error",
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
