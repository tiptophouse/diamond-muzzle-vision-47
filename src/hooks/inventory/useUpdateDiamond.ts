
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { api, apiEndpoints } from '@/lib/api';

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

    // Validate diamond ID format
    if (!diamondId || diamondId.trim() === '') {
      console.error('Invalid diamond ID:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID. Please refresh and try again.",
      });
      return false;
    }

    try {
      console.log('Updating diamond ID:', diamondId, 'with data:', data);
      
      // Prepare update data in FastAPI format
      const updateData = {
        user_id: user.id,
        stock_number: data.stockNumber?.toString() || '',
        shape: data.shape || 'Round',
        weight: Number(data.carat) || 1,
        color: data.color || 'G',
        clarity: data.clarity || 'VS1',
        cut: data.cut || 'Excellent',
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status || 'Available',
        picture: data.picture || null,
        
        // Certificate Information
        certificate_number: data.certificateNumber ? Number(data.certificateNumber) : null,
        certificate_url: data.certificateUrl || null,
        certificate_comment: data.certificateComment || null,
        lab: data.lab || 'GIA',
        
        // Physical Measurements
        length: data.length ? Number(data.length) : null,
        width: data.width ? Number(data.width) : null,
        depth: data.depth ? Number(data.depth) : null,
        ratio: data.ratio ? Number(data.ratio) : null,
        
        // Detailed Grading
        table_percentage: data.tablePercentage ? Number(data.tablePercentage) : null,
        depth_percentage: data.depthPercentage ? Number(data.depthPercentage) : null,
        fluorescence: data.fluorescence || 'None',
        polish: data.polish || 'Excellent',
        symmetry: data.symmetry || 'Excellent',
        gridle: data.gridle || 'Medium',
        culet: data.culet || 'None',
        
        // Business Information
        rapnet: data.rapnet ? Number(data.rapnet) : null,
        store_visible: data.storeVisible || false,
      };

      console.log('FastAPI update data:', updateData);

      const endpoint = apiEndpoints.updateDiamond(diamondId);
      const { data: responseData, error } = await api.put(endpoint, updateData);

      if (error) {
        console.error('FastAPI update error:', error);
        
        if (error.includes('not found')) {
          throw new Error('Diamond not found. It may have been deleted.');
        } else if (error.includes('permission') || error.includes('unauthorized')) {
          throw new Error('You do not have permission to update this diamond.');
        } else if (error.includes('validation')) {
          throw new Error('Invalid data provided. Please check all fields.');
        } else {
          throw new Error(`Update failed: ${error}`);
        }
      }

      if (!responseData) {
        throw new Error('No response data received from server');
      }

      console.log('Diamond updated successfully via FastAPI:', responseData);
      
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to update diamond via FastAPI:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { updateDiamond };
}
