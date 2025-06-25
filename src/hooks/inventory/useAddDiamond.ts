
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';

export function useAddDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { trackDiamondOperation } = useEnhancedUserTracking();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required ❌",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    try {
      console.log('➕ ADD DIAMOND: Starting add operation for user:', user.id);
      
      // Show loading toast
      toast({
        title: "Adding Diamond... ⏳",
        description: "Please wait while we add this diamond to your inventory",
      });

      const diamondData = {
        stock_number: data.stockNumber || `STOCK-${Date.now()}`,
        shape: data.shape || 'Round',
        weight: Number(data.carat) || 0,
        color: data.color || 'D',
        clarity: data.clarity || 'FL',
        cut: data.cut || 'Excellent',
        price: Number(data.price) || 0,
        price_per_carat: data.price ? Math.round(Number(data.price) / (Number(data.carat) || 1)) : 0,
        status: data.status || 'Available',
        picture: data.imageUrl || '',
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || 'GIA',
        store_visible: data.store_visible !== false,
      };

      const endpoint = apiEndpoints.addDiamond();
      console.log('➕ ADD DIAMOND: Using FastAPI endpoint:', endpoint);
      
      const result = await api.post(endpoint, diamondData);
      
      if (result.error) {
        console.error('❌ ADD DIAMOND: FastAPI add failed:', result.error);
        toast({
          title: "Add Failed ❌",
          description: `Failed to add diamond: ${result.error}`,
          variant: "destructive",
        });
        
        // Track failed addition
        await trackDiamondOperation('add', { 
          diamond_data: diamondData, 
          success: false, 
          error: result.error 
        });
        
        throw new Error(result.error);
      }

      console.log('✅ ADD DIAMOND: Successfully added to FastAPI');
      
      // Show success toast
      toast({
        title: "Diamond Added Successfully ✅",
        description: `Diamond "${diamondData.stock_number}" has been added to your inventory`,
      });
      
      // Track successful addition
      await trackDiamondOperation('add', { 
        diamond_data: diamondData, 
        success: true 
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ ADD DIAMOND: Unexpected error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Add Failed ❌",
        description: `Could not add diamond: ${errorMsg}. Please try again.`,
        variant: "destructive",
      });
      
      // Track failed addition
      await trackDiamondOperation('add', { 
        diamond_data: data, 
        success: false, 
        error: errorMsg 
      });
      
      throw error;
    }
  };

  return { addDiamond };
}
