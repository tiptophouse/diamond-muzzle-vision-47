
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { isValidUUID } from '@/utils/diamondUtils';
import { Diamond } from '@/components/inventory/InventoryTable';

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

    if (!diamondId) {
      console.error('Invalid diamond ID for deletion:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID",
      });
      return false;
    }

    console.log('🗑️ Starting deletion process for diamond:', diamondId);

    // Optimistic UI update - remove diamond immediately
    if (removeDiamondFromState) {
      console.log('🔄 Optimistically removing diamond from UI');
      removeDiamondFromState(diamondId);
    }

    try {
      console.log('🌐 Calling FastAPI delete endpoint for diamond:', diamondId, 'user:', user.id);
      
      // Call the FastAPI endpoint to delete the diamond
      const endpoint = apiEndpoints.deleteDiamond(diamondId);
      console.log('🔗 Delete endpoint:', endpoint);
      
      const response = await api.delete(endpoint);
      
      if (response.error) {
        console.error('❌ FastAPI delete failed:', response.error);
        throw new Error(response.error);
      }
      
      console.log('✅ FastAPI delete successful');
      
      // Also delete from Supabase as backup/sync
      console.log('🔄 Syncing delete with Supabase...');
      const { error: supabaseError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (supabaseError) {
        console.warn('⚠️ Supabase delete warning (non-critical):', supabaseError);
      } else {
        console.log('✅ Supabase sync delete successful');
      }
      
      toast({
        title: "✅ Success",
        description: "Diamond deleted successfully from inventory",
      });
      
      console.log('🎉 Diamond deletion completed successfully');
      if (onSuccess) {
        console.log('📢 Calling onSuccess callback');
        onSuccess();
      }
      return true;
    } catch (error) {
      console.error('❌ Diamond deletion failed:', error);
      
      // Restore diamond to state if deletion failed
      if (restoreDiamondToState && diamondData) {
        console.log('🔄 Restoring diamond to UI due to deletion failure');
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "❌ Deletion Failed", 
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}
