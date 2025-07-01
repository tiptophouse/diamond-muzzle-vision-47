
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    // Optimistically remove from UI first
    if (removeDiamondFromState && diamondData) {
      removeDiamondFromState(diamondId);
    }

    try {
      console.log('🗑️ Deleting diamond via FastAPI:', diamondId);
      
      const endpoint = apiEndpoints.deleteDiamond(diamondId, user.id);
      const result = await api.delete(endpoint);
      
      if (result.error) {
        throw new Error(result.error);
      }

      console.log('✅ Diamond deleted successfully via FastAPI');

      toast({
        title: "Success ✅",
        description: "Diamond deleted successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to delete diamond via FastAPI:', error);
      
      // Restore diamond to UI if deletion failed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Deletion Failed ❌",
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
