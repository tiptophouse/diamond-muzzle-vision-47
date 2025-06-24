
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useInventoryDataSync } from './useInventoryDataSync';

export function useAddDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { triggerInventoryChange } = useInventoryDataSync();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Map form data to match FastAPI expected format - user identification via JWT
      const stoneData = {
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
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
        store_visible: data.storeVisible !== false ? 1 : 0,
        fluorescence: data.fluorescence || 'None',
        polish: data.polish || 'Excellent',
        symmetry: data.symmetry || 'Excellent',
        gridle: data.gridle || 'Medium',
        culet: data.culet || 'None',
        length: data.length ? Number(data.length) : '',
        width: data.width ? Number(data.width) : '',
        depth: data.depth ? Number(data.depth) : '',
        table_percentage: data.tablePercentage ? Number(data.tablePercentage) : '',
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : '',
        certificate_comment: data.certificateComment || '',
      };

      console.log('➕ ADD DIAMOND: Adding stone for user:', user.id, 'via JWT auth');
      
      const endpoint = apiEndpoints.addDiamond();
      const result = await api.post(endpoint, stoneData);
      
      if (result.error) {
        console.error('❌ ADD DIAMOND: FastAPI add failed:', result.error);
        toast({
          title: "Add Failed ❌",
          description: `Failed to add stone: ${result.error}`,
          variant: "destructive",
        });
        throw new Error(result.error);
      }

      console.log('✅ ADD DIAMOND: Stone added successfully');
      
      toast({
        title: "Success ✅",
        description: "Stone added successfully to your inventory",
      });
      
      // Trigger real-time inventory update
      triggerInventoryChange();
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ ADD DIAMOND: Failed to add stone:', error);
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
