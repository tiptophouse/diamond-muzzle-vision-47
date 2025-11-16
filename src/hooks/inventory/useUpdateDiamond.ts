
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    console.log('📝 UPDATE: Starting update for diamond:', diamondId, 'with data:', data);

    // diamondId here should be the FastAPI integer ID, not local UUID
    const fastApiDiamondId = parseInt(diamondId);
    
    if (isNaN(fastApiDiamondId)) {
      console.error('❌ UPDATE: Invalid diamond ID:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID format",
      });
      return false;
    }

    try {
      // Transform the data to match the backend expectations
      const updatePayload = {
        stock: data.stockNumber,
        shape: data.shape?.toLowerCase(),
        weight: data.carat,
        color: data.color,
        clarity: data.clarity,
        lab: data.lab,
        certificate_number: data.certificateNumber ? parseInt(data.certificateNumber) : undefined,
        length: data.length,
        width: data.width,
        depth: data.depth,
        ratio: data.ratio,
        cut: data.cut,
        polish: data.polish,
        symmetry: data.symmetry,
        fluorescence: data.fluorescence,
        table: data.tablePercentage,
        depth_percentage: data.depthPercentage,
        gridle: data.gridle,
        culet: data.culet,
        certificate_comment: data.certificateComment,
        rapnet: data.rapnet,
        price_per_carat: data.pricePerCarat,
        picture: data.picture,
        store_visible: data.storeVisible,
      };

      // Remove undefined/null values
      Object.keys(updatePayload).forEach(key => 
        (updatePayload as any)[key] === undefined && delete (updatePayload as any)[key]
      );

      console.log('📝 UPDATE: Sending payload to FastAPI ID:', fastApiDiamondId, updatePayload);

      const { updateDiamond: updateDiamondAPI } = await import('@/api/diamonds');
      const response = await updateDiamondAPI(fastApiDiamondId, updatePayload);
      
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update diamond');
      }

      console.log('✅ UPDATE: Diamond updated successfully:', response);

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
