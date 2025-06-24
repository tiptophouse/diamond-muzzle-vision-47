
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { getCurrentUserId } from '@/lib/api';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useAddDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const userId = getCurrentUserId() || user.id;
      
      // Map form data to FastAPI expected format
      const stoneData = {
        user_id: userId,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat), // FastAPI expects 'weight' not 'carat'
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status || 'Available',
        picture: data.picture || '',
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || 'GIA',
        store_visible: data.storeVisible !== false, // Default to true
        // Additional fields that might be expected by FastAPI
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

      console.log('➕ Adding stone via FastAPI endpoint:', stoneData);
      
      const endpoint = apiEndpoints.addDiamond();
      console.log('➕ Using endpoint:', endpoint);
      const result = await api.post(endpoint, stoneData);
      
      if (result.error) {
        console.error('❌ ADD STONE: FastAPI add failed:', result.error);
        toast({
          title: "Add Failed ❌",
          description: `Failed to add stone: ${result.error}`,
          variant: "destructive",
        });
        throw new Error(result.error);
      }

      console.log('✅ ADD STONE: Stone added successfully to FastAPI');
      console.log('✅ ADD STONE: Response:', result.data);
      
      toast({
        title: "Success ✅",
        description: "Stone added successfully to your inventory",
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ ADD STONE: Failed to add to FastAPI:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Add Failed ❌",
        description: `Could not add stone: ${errorMsg}`,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { addDiamond };
}
