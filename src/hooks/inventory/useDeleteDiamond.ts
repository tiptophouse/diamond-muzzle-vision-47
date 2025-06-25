
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useInventoryDataSync } from './useInventoryDataSync';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
}

export function useDeleteDiamond({ onSuccess }: UseDeleteDiamondProps) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { triggerInventoryChange } = useInventoryDataSync();
  const { trackDiamondOperation } = useEnhancedUserTracking();

  const deleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required ❌",
        description: "Please log in to delete diamonds",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ DELETE DIAMOND: Starting deletion for user:', user.id, 'diamond:', diamondId);
      
      // Show loading toast
      toast({
        title: "Deleting Diamond... ⏳",
        description: "Please wait while we remove this diamond from your inventory",
      });
      
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      console.log('🗑️ DELETE DIAMOND: Using FastAPI endpoint:', endpoint);
      
      const result = await api.delete(endpoint);
      
      if (result.error) {
        console.error('❌ DELETE DIAMOND: FastAPI delete failed:', result.error);
        toast({
          title: "Delete Failed ❌",
          description: `Failed to delete diamond: ${result.error}`,
          variant: "destructive",
        });
        
        // Track failed deletion
        await trackDiamondOperation('delete', { 
          diamond_id: diamondId, 
          success: false, 
          error: result.error 
        });
        
        throw new Error(result.error);
      }

      console.log('✅ DELETE DIAMOND: Successfully deleted from FastAPI');
      
      // Show success toast
      toast({
        title: "Diamond Deleted Successfully ✅",
        description: "The diamond has been permanently removed from your inventory",
      });
      
      // Track successful deletion
      await trackDiamondOperation('delete', { 
        diamond_id: diamondId, 
        success: true 
      });
      
      // Trigger real-time inventory update
      triggerInventoryChange();
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ DELETE DIAMOND: Unexpected error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Delete Failed ❌", 
        description: `Could not delete diamond: ${errorMsg}. Please try again.`,
        variant: "destructive",
      });
      
      // Track failed deletion
      await trackDiamondOperation('delete', { 
        diamond_id: diamondId, 
        success: false, 
        error: errorMsg 
      });
      
      throw error;
    }
  };

  return { deleteDiamond };
}
