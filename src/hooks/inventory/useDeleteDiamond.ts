
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useInventoryDataSync } from './useInventoryDataSync';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
}

export function useDeleteDiamond({ onSuccess }: UseDeleteDiamondProps) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { triggerInventoryChange } = useInventoryDataSync();

  const deleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ DELETE DIAMOND: Deleting stone for user:', user.id, 'stone ID:', diamondId);
      
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      const result = await api.delete(endpoint);
      
      if (result.error) {
        console.error('❌ DELETE DIAMOND: FastAPI delete failed:', result.error);
        toast({
          title: "Delete Failed ❌",
          description: `Failed to delete stone: ${result.error}`,
          variant: "destructive",
        });
        throw new Error(result.error);
      }

      console.log('✅ DELETE DIAMOND: Stone deleted successfully');
      
      toast({
        title: "Success ✅",
        description: "Stone deleted successfully from your inventory",
      });
      
      // Trigger real-time inventory update
      triggerInventoryChange();
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ DELETE DIAMOND: Failed to delete stone:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Delete Failed ❌", 
        description: `Could not delete stone: ${errorMsg}`,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { deleteDiamond };
}
