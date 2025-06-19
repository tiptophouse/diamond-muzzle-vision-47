
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { Diamond } from "@/components/inventory/InventoryTable";

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ 
  onSuccess, 
  removeDiamondFromState, 
  restoreDiamondToState 
}: UseDeleteDiamondProps = {}) {
  const { toast } = useToast();

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond): Promise<boolean> => {
    if (!diamondData) {
      console.error('❌ DELETE: No diamond data provided for deletion');
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Diamond data not found. Please refresh and try again.",
      });
      return false;
    }

    console.log('🗑️ DELETE: Starting deletion process for diamond:', {
      id: diamondId,
      stockNumber: diamondData.stockNumber,
      shape: diamondData.shape,
      carat: diamondData.carat
    });

    // Optimistically remove from UI
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      // Use the correct FastAPI endpoint for deletion
      const endpoint = apiEndpoints.deleteDiamond(diamondData.stockNumber);
      console.log('🗑️ DELETE: Using endpoint:', endpoint);
      
      const response = await api.delete(endpoint);
      
      if (response.error) {
        console.error('❌ DELETE: FastAPI deletion failed:', response.error);
        
        // Restore diamond to state on failure
        if (restoreDiamondToState) {
          restoreDiamondToState(diamondData);
        }
        
        toast({
          variant: "destructive",
          title: "מחיקת האבן נכשלה",
          description: `Failed to delete diamond ${diamondData.stockNumber}: ${response.error}`,
        });
        return false;
      }

      console.log('✅ DELETE: Diamond deleted successfully from FastAPI backend');
      
      // Show success message
      toast({
        title: "אבן נמחקה בהצלחה",
        description: `Diamond ${diamondData.stockNumber} has been successfully deleted from your inventory.`,
      });

      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error('❌ DELETE: Unexpected error during deletion:', error);
      
      // Restore diamond to state on error
      if (restoreDiamondToState) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        variant: "destructive",
        title: "מחיקת האבן נכשלה",
        description: `Failed to delete diamond: ${errorMessage}`,
      });
      
      return false;
    }
  };

  return { deleteDiamond };
}
