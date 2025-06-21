
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
      console.error('❌ DELETE: User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ DELETE: Starting diamond deletion via edge function');
      console.log('🗑️ DELETE: Stock number to delete:', stockNumber);
      console.log('🗑️ DELETE: Diamond data:', diamondData);
      console.log('🗑️ DELETE: User ID:', user.id);
      
      // Optimistically remove from UI first (using diamond ID for state management)
      if (removeDiamondFromState && diamondData) {
        console.log('🗑️ DELETE: Optimistically removing diamond from UI');
        removeDiamondFromState(diamondData.id);
      }
      
      console.log('🗑️ DELETE: Making DELETE request via edge function...');
      const { data: response, error } = await supabase.functions.invoke('diamond-management', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'delete',
          'x-stock_number': stockNumber,
          'x-user_id': user.id.toString()
        }
      });
      
      console.log('🗑️ DELETE: Edge function response received:', response);
      
      if (error) {
        console.error('❌ DELETE: Edge function error:', error);
        
        // Restore diamond to UI if delete failed
        if (restoreDiamondToState && diamondData) {
          console.log('🔄 DELETE: Restoring diamond to UI due to error');
          restoreDiamondToState(diamondData);
        }
        
        toast({
          title: "❌ Delete Failed",
          description: error.message,
          variant: "destructive",
        });
        
        throw new Error(error.message);
      }

      // Check if the delete operation was successful
      if (!response?.success) {
        console.error('❌ DELETE: Edge function returned error:', response?.error);
        
        // Restore diamond to UI if delete failed
        if (restoreDiamondToState && diamondData) {
          console.log('🔄 DELETE: Restoring diamond to UI due to error');
          restoreDiamondToState(diamondData);
        }
        
        toast({
          title: "❌ Delete Failed",
          description: response?.error || 'Unknown error occurred',
          variant: "destructive",
        });
        
        throw new Error(`Delete failed: ${response?.error || 'Unknown error'}`);
      }

      console.log('✅ DELETE: Diamond deleted successfully via edge function');
      
      // Show success message
      toast({
        title: "Success ✅",
        description: response.message || `Diamond ${stockNumber} deleted successfully`,
      });
      
      console.log('✅ DELETE: Calling onSuccess callback');
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ DELETE: Complete error details:', error);
      
      // Restore diamond to UI if delete failed
      if (restoreDiamondToState && diamondData) {
        console.log('🔄 DELETE: Restoring diamond to UI due to exception');
        restoreDiamondToState(diamondData);
      }
      
      // Re-throw with more context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during deletion';
      throw new Error(`Failed to delete diamond: ${errorMessage}`);
    }
  };

  return { deleteDiamond };
}
