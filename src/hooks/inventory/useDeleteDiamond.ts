
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
}

export function useDeleteDiamond({ onSuccess }: UseDeleteDiamondProps) {
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

    try {
      console.log('🗑️ Deleting diamond via FastAPI:', diamondId);
      
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
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
