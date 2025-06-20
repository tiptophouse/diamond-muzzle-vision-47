
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
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ Deleting diamond via FastAPI:', diamondId);
      
      // Optimistically remove from UI
      if (removeDiamondFromState) {
        removeDiamondFromState(diamondId);
      }
      
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      const result = await api.delete(endpoint);
      
      // Check if the delete operation was successful
      if (result.error) {
        // Restore diamond to UI if delete failed
        if (restoreDiamondToState && diamondData) {
          restoreDiamondToState(diamondData);
        }
        throw new Error(result.error);
      }

      console.log('✅ Diamond deleted successfully from FastAPI backend');
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to delete diamond from FastAPI:', error);
      
      // Restore diamond to UI if delete failed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      throw error;
    }
  };

  return { deleteDiamond };
}
