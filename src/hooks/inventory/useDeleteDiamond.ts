
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
      // Try FastAPI first - DELETE /api/v1/delete_stone/{diamond_id}?user_id={user_id}
      try {
        const endpoint = apiEndpoints.deleteDiamond(fastApiDiamondId.toString(), user.id);
        console.log('🗑️ DELETE: Using endpoint:', endpoint);
        
        const response = await api.delete(endpoint);
        
        if (response.error) {
          throw new Error(response.error);
        }

        console.log('✅ DELETE: FastAPI response:', response.data);

        // Check if deletion was successful based on response
        if (response.data && (
          (response.data as any)?.status === 'success' || 
          (response.data as any)?.message
        )) {
          toast({
            title: "✅ Diamond Deleted Successfully",
            description: "Diamond has been permanently removed from your inventory",
          });
          
          if (onSuccess) onSuccess();
          return true;
        } else {
          throw new Error('Delete operation failed - no success confirmation from server');
        }
        
      } catch (apiError) {
        console.error('❌ DELETE: FastAPI delete failed:', apiError);
        
        // Parse specific error message from API
        let errorMessage = "Failed to delete diamond from server";
        if (apiError instanceof Error) {
          try {
            const errorData = JSON.parse(apiError.message);
            if (errorData.detail) {
              errorMessage = typeof errorData.detail === 'string' 
                ? errorData.detail 
                : `Validation error: ${JSON.stringify(errorData.detail)}`;
            }
          } catch {
            errorMessage = apiError.message;
          }
        }
        
        // Show specific API error to user
        toast({
          variant: "destructive",
          title: "❌ Delete Failed",
          description: errorMessage,
        });
        
        // Restore diamond to UI since API call failed
        if (restoreDiamondToState && diamondData) {
          restoreDiamondToState(diamondData);
        }
        
        return false;
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
