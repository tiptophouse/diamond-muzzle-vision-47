
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    if (!user?.id) {
      console.error('🗑️ DELETE DIAMOND: User not authenticated');
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    if (!diamondData) {
      console.error('🗑️ DELETE DIAMOND: Diamond data is required for deletion');
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Diamond data is required for deletion",
      });
      return false;
    }

    const stockNumber = diamondData.stockNumber;
    if (!stockNumber) {
      console.error('🗑️ DELETE DIAMOND: Stock number is required');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Stock number is required for deletion",
      });
      return false;
    }

    console.log('🗑️ DELETE DIAMOND: Starting deletion for stock number:', stockNumber);
    console.log('🗑️ DELETE DIAMOND: User ID:', user.id);
    console.log('🗑️ DELETE DIAMOND: Diamond data:', diamondData);

    // Optimistically remove from UI
    if (removeDiamondFromState) {
      console.log('🗑️ DELETE DIAMOND: Optimistically removing from UI');
      removeDiamondFromState(diamondId);
    }

    try {
      // Try FastAPI first with the correct endpoint and stock number
      try {
        const endpoint = apiEndpoints.deleteDiamond(stockNumber);
        console.log('🗑️ DELETE DIAMOND: Using FastAPI endpoint:', endpoint);
        
        const response = await api.delete(endpoint);
        console.log('🗑️ DELETE DIAMOND: FastAPI response:', response);
        
        if (response.error) {
          console.error('❌ DELETE DIAMOND: FastAPI error response:', response.error);
          throw new Error(response.error);
        }

        console.log('✅ DELETE DIAMOND: FastAPI deletion successful');

        toast({
          title: "Success",
          description: `Diamond ${stockNumber} deleted successfully`,
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.error('⚠️ DELETE DIAMOND: FastAPI deletion failed:', apiError);
        console.log('🔄 DELETE DIAMOND: Attempting localStorage fallback');
        
        // Fallback to localStorage
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const originalLength = existingData.length;
        const filteredData = existingData.filter((item: any) => 
          item.stockNumber !== stockNumber && 
          item.stock_number !== stockNumber &&
          item.stock !== stockNumber
        );
        
        if (filteredData.length < originalLength) {
          localStorage.setItem('diamond_inventory', JSON.stringify(filteredData));
          console.log('✅ DELETE DIAMOND: LocalStorage deletion successful');
          
          toast({
            title: "Success",
            description: `Diamond ${stockNumber} deleted successfully (from local storage)`,
          });
          
          if (onSuccess) onSuccess();
          return true;
        } else {
          console.error('❌ DELETE DIAMOND: Diamond not found in localStorage');
          throw new Error(`Diamond with stock number ${stockNumber} not found in local storage`);
        }
      }
      
    } catch (error) {
      console.error('❌ DELETE DIAMOND: Final deletion error:', error);
      
      // Restore diamond to UI on error
      if (restoreDiamondToState && diamondData) {
        console.log('🔄 DELETE DIAMOND: Restoring diamond to UI');
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: `Could not delete diamond ${stockNumber}: ${errorMessage}`,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
