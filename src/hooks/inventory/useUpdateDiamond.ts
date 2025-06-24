
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Map form data to FastAPI expected format (simple object with string/number values)
      const updates = {
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status || 'Available',
        store_visible: data.storeVisible !== false ? 1 : 0, // Convert boolean to number
        picture: data.picture || '',
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || 'GIA',
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

      console.log('📝 Updating stone via FastAPI endpoint:', diamondId, updates);
      
      const endpoint = apiEndpoints.updateDiamond(diamondId);
      console.log('📝 Using endpoint:', endpoint);
      const result = await api.put(endpoint, updates);
      
      if (result.error) {
        console.error('❌ UPDATE STONE: FastAPI update failed:', result.error);
        toast({
          title: "Update Failed ❌",
          description: `Failed to update stone: ${result.error}`,
          variant: "destructive",
        });
        throw new Error(result.error);
      }

      console.log('✅ UPDATE STONE: Stone updated successfully in FastAPI backend');
      console.log('✅ UPDATE STONE: Response:', result.data);
      
      toast({
        title: "Success ✅",
        description: "Stone updated successfully in your inventory",
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ UPDATE STONE: Failed to update in FastAPI:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Update Failed ❌",
        description: `Could not update stone: ${errorMsg}`,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { updateDiamond };
}
