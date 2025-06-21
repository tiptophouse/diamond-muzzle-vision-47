
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps) {
  const { user } = useTelegramAuth();

  const deleteDiamond = async (stockNumber: string, diamondData?: Diamond) => {
    if (!user?.id) {
      console.error('❌ DELETE HOOK: User not authenticated');
      toast({
        title: "❌ Authentication Required",
        description: "Please log in to delete diamonds",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    console.log('🗑️ DELETE HOOK: Starting enhanced deletion process');
    console.log('🗑️ DELETE HOOK: Stock number:', stockNumber);
    console.log('🗑️ DELETE HOOK: User ID:', user.id);
    
    // Optimistic UI update
    if (removeDiamondFromState && diamondData) {
      console.log('🗑️ DELETE HOOK: Optimistically removing from UI');
      removeDiamondFromState(diamondData.id);
    }

    try {
      console.log('🗑️ DELETE HOOK: Calling enhanced delete API...');
      
      const { data: response, error } = await supabase.functions.invoke('diamond-management', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'delete',
          'x-stock_number': stockNumber,
          'x-user_id': user.id.toString()
        }
      });
      
      console.log('🗑️ DELETE HOOK: API response received:', response);
      
      if (error) {
        console.error('❌ DELETE HOOK: API error:', error);
        
        // Restore UI state on error
        if (restoreDiamondToState && diamondData) {
          console.log('🔄 DELETE HOOK: Restoring diamond to UI');
          restoreDiamondToState(diamondData);
        }
        
        toast({
          title: "❌ Delete Failed",
          description: `Failed to delete diamond: ${error.message}`,
          variant: "destructive",
        });
        
        throw new Error(error.message);
      }

      if (!response?.success) {
        console.error('❌ DELETE HOOK: Operation failed:', response?.error);
        
        // Restore UI state on error
        if (restoreDiamondToState && diamondData) {
          console.log('🔄 DELETE HOOK: Restoring diamond to UI');
          restoreDiamondToState(diamondData);
        }
        
        toast({
          title: "❌ Delete Failed",
          description: response?.error || 'Unknown error occurred',
          variant: "destructive",
        });
        
        throw new Error(response?.error || 'Delete operation failed');
      }

      console.log('✅ DELETE HOOK: Diamond deleted successfully');
      
      // Show success message
      toast({
        title: "Success ✅",
        description: response.message || `Diamond ${stockNumber} deleted successfully`,
      });
      
      if (onSuccess) {
        console.log('✅ DELETE HOOK: Calling success callback');
        onSuccess();
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ DELETE HOOK: Unexpected error:', error);
      
      // Restore UI state on error
      if (restoreDiamondToState && diamondData) {
        console.log('🔄 DELETE HOOK: Restoring diamond to UI due to exception');
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "❌ Delete Failed",
        description: `Failed to delete diamond: ${errorMessage}`,
        variant: "destructive",
      });
      
      throw new Error(`Delete operation failed: ${errorMessage}`);
    }
  };

  return { deleteDiamond };
}
