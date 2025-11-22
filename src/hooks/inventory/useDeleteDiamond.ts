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
      const error = 'User authentication required to delete diamonds';
      console.error('❌ DELETE: User not authenticated - BLOCKING');
      toast({
        variant: "destructive",
        title: "❌ Authentication Error",
        description: error,
      });
      alert(`❌ DELETE DIAMOND FAILED\n\n${error}\n\nPlease ensure you're logged in through Telegram.`);
      return false;
    }

    const stockNumber = diamondData?.stockNumber || diamondId;
    const localDiamondId = diamondData?.id || diamondId;
    
    // Extract numeric diamond ID from the data
    const numericDiamondId = extractDiamondId(diamondData);
    
    // Validate diamond ID BEFORE any action
    if (!numericDiamondId || typeof numericDiamondId !== 'number') {
      const error = `Invalid diamond_id: got ${numericDiamondId} (${typeof numericDiamondId}), expected number`;
      console.error('❌ DELETE VALIDATION FAIL:', error);
      toast({
        variant: "destructive",
        title: "❌ Validation Error",
        description: error,
        duration: 10000
      });
      alert(`❌ VALIDATION ERROR\n\n${error}\n\nCannot proceed with DELETE.`);
      return false;
    }

    console.info('[CRUD START]', { 
      action: 'DELETE',
      diamondId: numericDiamondId,
      stockNumber,
      userId: user.id,
      localDiamondId
    });
    
    // Show loading toast
    toast({
      title: "⏳ Deleting Diamond...",
      description: `Removing stock ${stockNumber}`
    });

    console.log('🗑️ DELETE: Starting delete for diamond:', numericDiamondId);
    console.log('🗑️ DELETE: Stock number:', stockNumber);
    console.log('🗑️ DELETE: User ID:', user.id);

    // Optimistically remove from UI
    if (removeDiamondFromState) {
      removeDiamondFromState(localDiamondId);
    }

    try {
      console.log('🗑️ DELETE: Using diamond ID:', numericDiamondId, 'Type:', typeof numericDiamondId);
      
      // Use the FastAPI endpoint with JWT authentication (userId is extracted from JWT)
      const response = await deleteDiamondAPI(numericDiamondId);
      
      if (response.success) {
        console.info('[CRUD SUCCESS]', {
          action: 'DELETE',
          diamondId: numericDiamondId,
          stockNumber,
          userId: user.id,
          response
        });

        toast({
          title: "✅ Diamond Deleted Successfully",
          description: `Stock ${stockNumber} removed from inventory`
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
      console.error('[CRUD FAIL]', {
        action: 'DELETE',
        diamondId: numericDiamondId,
        stockNumber,
        userId: user.id,
        localDiamondId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
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
      
      // Show detailed error information
      const errorDetails = `
Stock: ${stockNumber}
ID: ${localDiamondId}
Error: ${error.message || error.name || 'Unknown error'}
${error.stack ? `\nStack: ${error.stack.substring(0, 200)}` : ''}
      `.trim();

      // Always show error toast with details
      toast({
        variant: "destructive",
        title: "❌ Delete Failed",
        description: errorDetails,
        duration: 10000, // Show for 10 seconds
      });

      // Also alert for visibility
      alert(`❌ DELETE FAILED\n\n${errorDetails}`);
      
      return false;
    }
  };

  return { deleteDiamond };
}