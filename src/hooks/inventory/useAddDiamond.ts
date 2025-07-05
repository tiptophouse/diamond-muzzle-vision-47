
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';

interface UseAddDiamondProps {
  onSuccess?: () => void;
  onRefreshInventory?: () => void;
}

export function useAddDiamond({ onSuccess, onRefreshInventory }: UseAddDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      console.log('➕ ADD: Starting add diamond operation');
      
      // Match FastAPI DiamondCreateRequest schema exactly
      const diamondDataPayload = {
        stock: data.stockNumber,
        shape: data.shape?.toLowerCase() || 'round brilliant',
        weight: Number(data.carat) || 1,
        color: data.color || 'G',
        clarity: data.clarity || 'VS1',
        lab: data.lab || 'GIA',
        certificate_number: parseInt(data.certificateNumber || '0') || Math.floor(Math.random() * 1000000),
        length: Number(data.length) || 6.5,
        width: Number(data.width) || 6.5,
        depth: Number(data.depth) || 4.0,
        ratio: Number(data.ratio) || 1.0,
        cut: data.cut?.toUpperCase() || 'EXCELLENT',
        polish: data.polish?.toUpperCase() || 'EXCELLENT',
        symmetry: data.symmetry?.toUpperCase() || 'EXCELLENT',
        fluorescence: data.fluorescence?.toUpperCase() || 'NONE',
        table: Number(data.tablePercentage) || 60,
        depth_percentage: Number(data.depthPercentage) || 62,
        gridle: data.gridle || 'Medium',
        culet: data.culet?.toUpperCase() || 'NONE',
        certificate_comment: data.certificateComment || null,
        rapnet: data.rapnet ? parseInt(data.rapnet.toString()) : null,
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)) || null,
        picture: data.picture || null,
      };

      // Call POST /api/v1/diamonds
      const endpoint = apiEndpoints.addDiamond();
      console.log('➕ ADD: Calling endpoint:', endpoint, 'with data:', diamondDataPayload);
      
      const response = await api.post(endpoint, diamondDataPayload);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ ADD: Diamond added successfully');
      
      // Show success message
      toast({
        title: "Success",
        description: "Diamond added successfully to inventory",
      });
      
      // Refresh inventory by calling GET /api/v1/get_all_stones
      if (onRefreshInventory) {
        console.log('🔄 ADD: Refreshing inventory after successful addition');
        onRefreshInventory();
      }
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ ADD: Failed to add diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Add Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { addDiamond };
}
