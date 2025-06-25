
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { getBackendAccessToken } from '@/lib/api/config';

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

      // Get the access token dynamically
      const accessToken = await getBackendAccessToken();
      
      if (!accessToken) {
        throw new Error('No access token available for authentication');
      }

      // Use the correct FastAPI v1 endpoint structure
      const diamondData = {
        shape: data.shape,
        weight: data.carat, // FastAPI expects 'weight' not 'carat'
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: data.price || 0, // FastAPI expects price, not price_per_carat
        // Add other fields as needed by the API
        polish: data.polish,
        symmetry: data.symmetry,
        fluorescence: data.fluorescence
      };

      const response = await fetch('https://api.mazalbot.com/api/v1/diamonds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(diamondData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to add diamond');
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
