
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
    
    // diamondId is now already the correct FastAPI ID from the table row
    const fastApiDiamondId = diamondId;
    console.log('🗑️ DELETE: Using FastAPI diamond ID:', fastApiDiamondId);
    
    // Find the diamond in UI for optimistic removal
    const localDiamondId = diamondData?.id || diamondId;

    // Optimistically remove from UI using the local diamond ID
    if (removeDiamondFromState) {
      removeDiamondFromState(localDiamondId);
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
          title: "✅ יהלום נמחק בהצלחה",
          description: "היהלום הוסר מהמלאי, הדאשבורד והחנות שלך",
        });
        
        if (onSuccess) onSuccess();
        return true;
        
      } catch (apiError) {
        console.error('❌ DELETE: FastAPI delete failed:', apiError);
        
        // Show user-friendly error message about API connection
        toast({
          variant: "destructive",
          title: "⚠️ בעיית חיבור לשרת",
          description: "לא ניתן להתחבר לשרת. היהלום יוסר מקומית עד לחידוש החיבור.",
        });
        
        // Fallback to localStorage with user notification
        console.log('🔄 DELETE: Falling back to localStorage...');
        const existingData = JSON.parse(localStorage.getItem('diamond_inventory') || '[]');
        const filteredData = existingData.filter((item: any) => 
          item.id !== localDiamondId && item.diamondId !== fastApiDiamondId && item.stockNumber !== diamondData?.stockNumber
        );
        
        if (filteredData.length < existingData.length) {
          localStorage.setItem('diamond_inventory', JSON.stringify(filteredData));
          
          toast({
            title: "✅ יהלום נמחק מקומית",
            description: "היהלום הוסר במצב לא מקוון ויסונכרן כשהחיבור לשרת יתחדש",
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
        title: "❌ מחיקה נכשלה",
        description: "נכשל במחיקת היהלום. אנא נסה שוב.",
      });
      
      return false;
    }
  };

  return { deleteDiamond };
}
