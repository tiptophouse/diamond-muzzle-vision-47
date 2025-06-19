
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps) {
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

    console.log('🗑️ DELETE DIAMOND: Starting deletion for ID:', diamondId);
    console.log('🗑️ DELETE DIAMOND: Diamond data:', diamondData);

    // Optimistically remove from UI
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      // Try FastAPI first with the fixed endpoint
      try {
        const endpoint = apiEndpoints.deleteDiamond(diamondId);
        console.log('🗑️ DELETE DIAMOND: Using endpoint:', endpoint);
        
        const response = await api.delete(endpoint);
        
        if (response.error) {
          console.error('❌ DELETE DIAMOND: FastAPI error:', response.error);
          throw new Error(response.error);
        }

        console.log('✅ DELETE DIAMOND: FastAPI success, response:', response.data);

        toast({
          title: "Success",
          description: "Diamond deleted successfully",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.warn('⚠️ DELETE DIAMOND: FastAPI failed, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const filteredData = existingData.filter((item: any) => item.id !== diamondId);
        
        if (filteredData.length < existingData.length) {
          localStorage.setItem('diamond_inventory', JSON.stringify(filteredData));
          
          toast({
            title: "Success",
            description: "Diamond deleted successfully (from local storage)",
          });
          
          if (onSuccess) onSuccess();
          return true;
        } else {
          throw new Error('Diamond not found in local storage');
        }
      }
      
    } catch (error) {
      console.error('❌ DELETE DIAMOND: Final error:', error);
      
      // Restore diamond to UI on error
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
