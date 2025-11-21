import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { deleteDiamond as deleteDiamondAPI } from '@/api/diamonds';
import { extractDiamondId } from '@/api/diamondTransformers';
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
      // Extract numeric diamond ID from the data
      const numericDiamondId = extractDiamondId(diamondData);
      
      if (!numericDiamondId) {
        throw new Error(`Cannot delete diamond: Invalid ID for stock ${stockNumber}`);
      }
      
      console.log('🗑️ DELETE: Using diamond ID:', numericDiamondId);
      
      // Use the FastAPI endpoint with JWT authentication (userId is extracted from JWT)
      const response = await deleteDiamondAPI(numericDiamondId);
      
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
      console.error('❌ DELETE: Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        stockNumber,
        diamondId: localDiamondId
      });
      
      // Restore diamond to UI on error
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }

      // Determine error type and show appropriate message
      let errorMessage = 'אירעה שגיאה בעת מחיקת היהלום';
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = 'שגיאת אימות - אנא התחבר מחדש';
      } else if (error.message?.includes('fetch') || error.name === 'TypeError') {
        errorMessage = 'אין חיבור לשרת - נסה שוב מאוחר יותר';
      } else if (error.message?.includes('Invalid ID')) {
        errorMessage = 'מזהה יהלום לא תקין';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Always show error toast
      toast({
        variant: "destructive",
        title: "❌ מחיקה נכשלה",
        description: errorMessage,
        duration: 5000, // Show for 5 seconds
      });
      
      return false;
    }
  };

  return { deleteDiamond };
}