
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
}

export function useDeleteDiamond({ onSuccess }: UseDeleteDiamondProps) {
  const { user } = useTelegramAuth();

  const deleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ Deleting diamond via FastAPI with correct endpoint:', diamondId);
      
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      console.log('🗑️ Using delete endpoint:', endpoint);
      
      const result = await api.delete(endpoint);
      
      // Check if the delete operation was successful
      if (result.error) {
        throw new Error(result.error);
      }

      console.log('✅ Diamond deleted successfully from FastAPI backend');
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to delete diamond from FastAPI:', error);
      throw error;
    }
  };

  return { deleteDiamond };
}
