
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { getAccessToken } from '@/lib/api/config';
import { DiamondFormData } from '@/components/inventory/form/types';

export function useAddDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();
  const { trackDiamondOperation } = useEnhancedUserTracking();
  const { triggerInventoryChange } = useInventoryDataSync();

  const addDiamondMutation = useMutation({
    mutationFn: async (data: DiamondFormData): Promise<boolean> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No authentication token available');
      }

      // Use the correct FastAPI v1 endpoint structure
      const diamondData = {
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: data.carat, // FastAPI expects 'weight' not 'carat'
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: data.price || 0,
        price_per_carat: data.pricePerCarat || (data.carat > 0 ? Math.round(data.price / data.carat) : Math.round(data.price)),
        status: data.status || 'Available',
        store_visible: data.storeVisible !== false ? 1 : 0,
        picture: data.picture || '',
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || 'GIA',
        fluorescence: data.fluorescence || 'None',
        polish: data.polish || 'Excellent',
        symmetry: data.symmetry || 'Excellent',
        gridle: data.gridle || 'Medium',
        culet: data.culet || 'None',
        length: data.length ? Number(data.length) : null,
        width: data.width ? Number(data.width) : null,
        depth: data.depth ? Number(data.depth) : null,
        table_percentage: data.tablePercentage ? Number(data.tablePercentage) : null,
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : null,
        certificate_comment: data.certificateComment || '',
      };

      console.log('➕ ADD: Adding diamond with data:', diamondData);

      const response = await fetch('https://api.mazalbot.com/api/v1/diamonds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Telegram-User-ID': user.id.toString()
        },
        body: JSON.stringify(diamondData),
      });

      console.log('➕ ADD: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('➕ ADD: Failed to add diamond:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to add diamond');
      }

      const result = await response.json();
      console.log('➕ ADD: Diamond added successfully:', result);

      return true;
    },
    onSuccess: () => {
      toast({
        title: "✅ Success",
        description: "Diamond added successfully to your inventory!",
      });
      
      trackDiamondOperation('add', { success: true });
      
      // Trigger inventory refresh
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
