
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

    console.log('🗑️ DELETE: Starting delete for diamond:', diamondId);
    
    // Use the actual FastAPI diamond ID if available
    const fastApiDiamondId = diamondData?.diamondId || diamondId;
    console.log('🗑️ DELETE: Using FastAPI diamond ID:', fastApiDiamondId);

    // Optimistically remove from UI
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      // Try FastAPI first - DELETE /api/v1/delete_stone/{diamond_id}?user_id={user_id}&diamond_id={diamond_id}
      try {
        const endpoint = apiEndpoints.deleteDiamond(fastApiDiamondId.toString(), user.id);
        console.log('🗑️ DELETE: Using endpoint:', endpoint);
        
        const response = await api.delete(endpoint);
        
        if (response.error) {
          throw new Error(response.error);
        }

        console.log('✅ DELETE: FastAPI response:', response.data);

        toast({
          title: "✅ Diamond Deleted Successfully",
          description: "Diamond has been removed from your inventory, dashboard, and store",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.error('❌ DELETE: FastAPI delete failed:', apiError);
        
        // Show user-friendly error message about API connection
        toast({
          variant: "destructive",
          title: "⚠️ API Connection Issue",
          description: "Unable to connect to server. Diamond will be removed locally until connection is restored.",
        });
        
        // Fallback to localStorage with user notification
        console.log('🔄 DELETE: Falling back to localStorage...');
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const filteredData = existingData.filter((item: any) => item.id !== diamondId);
        
        if (filteredData.length < existingData.length) {
          localStorage.setItem('diamond_inventory', JSON.stringify(filteredData));
          
          toast({
            title: "✅ Diamond Deleted Locally",
            description: "Diamond has been removed offline and will sync when server connection is restored",
          });
          
          if (onSuccess) onSuccess();
          return true;
        } else {
          throw new Error('Diamond not found in local or remote storage');
        }
      }
      
    } catch (error) {
      console.error('❌ DELETE: Unexpected error:', error);
      
      // Restore diamond to UI on error
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      
      toast({
        variant: "destructive",
        title: "❌ Delete Failed",
        description: "Failed to delete diamond. Please try again.",
      });
      
      return false;
    }
  };

  return { deleteDiamond };
}
