
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
}

export function useDeleteDiamond({ onSuccess }: UseDeleteDiamondProps) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const deleteDiamond = async (diamondId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ DELETING STONE: Starting delete for diamond ID:', diamondId);
      
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      console.log('🗑️ DELETING STONE: Using endpoint:', endpoint);
      console.log('🗑️ DELETING STONE: Full URL:', `https://api.mazalbot.com${endpoint}`);
      
      const result = await api.delete(endpoint);
      
      if (result.error) {
        console.error('❌ DELETING STONE: FastAPI delete failed:', result.error);
        toast({
          title: "Delete Failed ❌",
          description: `Failed to delete stone: ${result.error}`,
          variant: "destructive",
        });
        throw new Error(result.error);
      }

      console.log('✅ DELETING STONE: Stone deleted successfully from FastAPI');
      console.log('✅ DELETING STONE: Response:', result.data);
      
      toast({
        title: "Success ✅",
        description: "Stone deleted successfully from your inventory",
      });
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ DELETING STONE: Failed to delete from FastAPI:', error);
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
