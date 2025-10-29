import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { deleteDiamond as deleteDiamondAPI } from '@/api/diamonds';
import { useInventoryDataSync } from './useInventoryDataSync';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { triggerInventoryChange } = useInventoryDataSync();

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    console.log('🗑️ DELETE: Starting delete for diamond:', diamondId);
    
    const stockNumber = diamondData?.stockNumber || diamondId;
    const localDiamondId = diamondData?.id || diamondId;

    // Optimistically remove from UI
    if (removeDiamondFromState) {
      removeDiamondFromState(localDiamondId);
    }

    try {
      // Use the new API function with proper error handling
      const response = await deleteDiamondAPI(stockNumber, user.id);
      
      if (response.success) {
        console.log('✅ DELETE: Diamond deleted successfully:', response);

        toast({
          title: "✅ Diamond Deleted",
          description: `Diamond ${stockNumber} has been permanently removed from your inventory and will no longer appear in your store.`,
        });

        // Trigger inventory refresh for real-time updates
        triggerInventoryChange();
        
        if (onSuccess) onSuccess();
        return true;
      } else {
        console.error('❌ DELETE: API returned failure:', response.message);
        throw new Error(response.message || 'Failed to delete diamond');
      }
      
    } catch (error: any) {
      console.error('❌ DELETE: Failed to delete diamond:', error);
      
      // Restore diamond to UI on error
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }

      // Show error message with fallback to localStorage
      const isNetworkError = error.message?.includes('fetch') || error.name === 'TypeError';
      
      if (isNetworkError) {
        // Network error - try localStorage fallback
        console.log('🔄 DELETE: Network error, falling back to localStorage...');
        try {
          const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
          const filteredData = existingData.filter((item: any) => 
            item.id !== localDiamondId && 
            item.stockNumber !== stockNumber
          );
          
          if (filteredData.length < existingData.length) {
            localStorage.setItem('diamond_inventory', JSON.stringify(filteredData));
            
            toast({
              title: "Diamond removed locally",
              description: "Diamond removed offline. Will sync when connection is restored.",
            });
            
            triggerInventoryChange();
            if (onSuccess) onSuccess();
            return true;
          }
        } catch (localError) {
          console.error('❌ DELETE: LocalStorage fallback failed:', localError);
        }
      }
      
      toast({
        variant: "destructive",
        title: "❌ Delete Failed",
        description: `Could not delete diamond ${stockNumber}. ${error.message || 'Please try again.'}`,
      });
      
      return false;
    }
  };

  return { deleteDiamond };
}