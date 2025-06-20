
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps) {
  const { user } = useTelegramAuth();

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    if (!user?.id) {
      console.error('❌ DELETE: User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ DELETE: Starting diamond deletion process');
      console.log('🗑️ DELETE: Diamond ID to delete:', diamondId);
      console.log('🗑️ DELETE: Diamond data:', diamondData);
      console.log('🗑️ DELETE: User ID:', user.id);
      
      // Optimistically remove from UI first
      if (removeDiamondFromState) {
        console.log('🗑️ DELETE: Optimistically removing diamond from UI');
        removeDiamondFromState(diamondId);
      }
      
      // Build the endpoint - try different ID formats
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      console.log('🗑️ DELETE: API endpoint:', endpoint);
      
      // Make the delete request
      console.log('🗑️ DELETE: Making DELETE request to FastAPI...');
      const result = await api.delete(endpoint);
      
      console.log('🗑️ DELETE: FastAPI response received:', result);
      
      // Check if the delete operation was successful
      if (result.error) {
        console.error('❌ DELETE: FastAPI returned error:', result.error);
        
        // Restore diamond to UI if delete failed
        if (restoreDiamondToState && diamondData) {
          console.log('🔄 DELETE: Restoring diamond to UI due to error');
          restoreDiamondToState(diamondData);
        }
        
        throw new Error(`Delete failed: ${result.error}`);
      }

      console.log('✅ DELETE: Diamond deleted successfully from FastAPI backend');
      console.log('✅ DELETE: Calling onSuccess callback');
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ DELETE: Complete error details:', error);
      console.error('❌ DELETE: Error type:', typeof error);
      console.error('❌ DELETE: Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Restore diamond to UI if delete failed
      if (restoreDiamondToState && diamondData) {
        console.log('🔄 DELETE: Restoring diamond to UI due to exception');
        restoreDiamondToState(diamondData);
      }
      
      // Re-throw with more context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during deletion';
      throw new Error(`Failed to delete diamond: ${errorMessage}`);
    }
  };

  return { deleteDiamond };
}
