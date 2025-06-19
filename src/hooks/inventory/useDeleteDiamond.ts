
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

    // Optimistically remove from UI immediately
    if (removeDiamondFromState) {
      console.log('🗑️ DELETE DIAMOND: Optimistically removing from UI');
      removeDiamondFromState(diamondId);
    }

    try {
      // Use the correct FastAPI endpoint for deletion
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
      
    } catch (error) {
      console.error('❌ DELETE DIAMOND: Deletion failed:', error);
      
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
