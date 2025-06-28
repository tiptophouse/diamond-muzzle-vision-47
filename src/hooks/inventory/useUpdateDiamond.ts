
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useToast } from '@/hooks/use-toast';
import { useInventoryDataSync } from './useInventoryDataSync';
import { secureApiService } from '@/services/secureApiService';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { triggerInventoryChange } = useInventoryDataSync();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const updates = {
        stock_number: data.stockNumber || diamondId,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
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
        length: data.length ? Number(data.length) : '',
        width: data.width ? Number(data.width) : '',
        depth: data.depth ? Number(data.depth) : '',
        table_percentage: data.tablePercentage ? Number(data.tablePercentage) : '',
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : '',
        certificate_comment: data.certificateComment || '',
      };

      console.log('📝 UPDATE DIAMOND: Updating stone for user:', user.id, 'stone ID:', diamondId);
      
      const result = await secureApiService.updateStone(diamondId, updates);
      
      if (!result.success) {
        console.error('❌ UPDATE DIAMOND: Secure API update failed:', result.error);
        toast({
          title: "Update Failed ❌",
          description: `Failed to update stone: ${result.error}`,
          variant: "destructive",
        });
        throw new Error(result.error || 'Update failed');
      }

      console.log('✅ UPDATE DIAMOND: Stone updated successfully');
      
      toast({
        title: "Success ✅",
        description: "Stone updated successfully in your inventory",
      });
      
      // Trigger real-time inventory update
      triggerInventoryChange();
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ UPDATE DIAMOND: Failed to update stone:', error);
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
