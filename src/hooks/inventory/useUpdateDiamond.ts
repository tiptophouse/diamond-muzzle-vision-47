
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';

interface UseUpdateDiamondProps {
  onSuccess?: () => void;
  onRefreshInventory?: () => void;
}

export function useUpdateDiamond({ onSuccess, onRefreshInventory }: UseUpdateDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      console.log('📝 UPDATE: Starting update operation for diamond:', diamondId);
      
      // Prepare update data according to FastAPI schema
      const updateData = {
        stock: data.stockNumber,
        shape: data.shape?.toLowerCase(),
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        lab: data.lab,
        certificate_number: parseInt(data.certificateNumber || '0'),
        length: Number(data.length),
        width: Number(data.width),
        depth: Number(data.depth),
        ratio: Number(data.ratio),
        cut: data.cut?.toUpperCase(),
        polish: data.polish?.toUpperCase(),
        symmetry: data.symmetry?.toUpperCase(),
        fluorescence: data.fluorescence?.toUpperCase(),
        table: Number(data.tablePercentage),
        depth_percentage: Number(data.depthPercentage),
        gridle: data.gridle,
        culet: data.culet?.toUpperCase(),
        certificate_comment: data.certificateComment,
        rapnet: data.rapnet ? parseInt(data.rapnet.toString()) : null,
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        picture: data.picture,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Call PUT /api/v1/diamonds/{diamond_id}
      const endpoint = apiEndpoints.updateDiamond(diamondId);
      console.log('📝 UPDATE: Calling endpoint:', endpoint, 'with data:', updateData);
      
      const response = await api.put(endpoint, updateData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ UPDATE: Diamond updated successfully');
      
      // Show success message
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
      
      // Refresh inventory by calling GET /api/v1/get_all_stones
      if (onRefreshInventory) {
        console.log('🔄 UPDATE: Refreshing inventory after successful update');
        onRefreshInventory();
      }
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ UPDATE: Failed to update diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { updateDiamond };
}
