
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { roundToInteger } from '@/utils/numberUtils';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      console.error('❌ UPDATE: User not authenticated');
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    try {
      console.log('📝 UPDATE: Starting update for diamond:', diamondId);
      console.log('📝 UPDATE: Form data received:', data);
      
      // Use the FastAPI diamond ID if it's a number, otherwise use the provided ID
      const fastApiDiamondId = /^\d+$/.test(diamondId) ? diamondId : diamondId;
      const endpoint = apiEndpoints.updateDiamond(fastApiDiamondId, user.id);
      console.log('📝 UPDATE: Using endpoint:', endpoint);
      console.log('📝 UPDATE: User ID:', user.id, 'type:', typeof user.id);
      
      // Prepare update data according to FastAPI schema - ensure all numbers are integers
      const updateData = {
        stock: data.stockNumber,
        shape: data.shape?.toLowerCase(),
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut?.toUpperCase(),
        polish: data.polish?.toUpperCase(),
        symmetry: data.symmetry?.toUpperCase(),
        fluorescence: data.fluorescence?.toUpperCase(),
        price_per_carat: data.carat > 0 ? roundToInteger(Number(data.price) / Number(data.carat)) : roundToInteger(Number(data.price)),
        status: data.status,
        store_visible: data.storeVisible,
        picture: data.picture,
        certificate_url: data.certificateUrl,
        certificate_comment: data.certificateComment,
        lab: data.lab,
        certificate_number: data.certificateNumber ? parseInt(String(data.certificateNumber)) : null,
        length: data.length ? Number(data.length) : null,
        width: data.width ? Number(data.width) : null,
        depth: data.depth ? Number(data.depth) : null,
        ratio: data.ratio ? Number(data.ratio) : null,
        table: data.tablePercentage ? Number(data.tablePercentage) : null,
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : null,
        gridle: data.gridle,
        culet: data.culet?.toUpperCase(),
        rapnet: data.rapnet ? Number(data.rapnet) : null,
        // Add the total price field that FastAPI expects
        price: roundToInteger(Number(data.price)),
      };

      // Remove null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log('📝 UPDATE: Sending data to FastAPI (all integers):', updateData);
      
      const response = await api.put(endpoint, updateData);
      
      if (response.error) {
        console.error('❌ UPDATE: FastAPI returned error:', response.error);
        throw new Error(response.error);
      }

      console.log('✅ UPDATE: FastAPI response successful:', response.data);

      toast({
        title: "✅ Success",
        description: "Diamond updated successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
        
    } catch (error) {
      console.error('❌ UPDATE: API update failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Update Diamond",
        description: errorMessage,
      });
      
      return false;
    }
  };

  return { updateDiamond };
}
