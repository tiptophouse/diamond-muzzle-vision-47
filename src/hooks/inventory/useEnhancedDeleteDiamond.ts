
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { isValidUUID } from '@/utils/diamondUtils';
import { Diamond } from '@/components/inventory/InventoryTable';

interface UseEnhancedDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useEnhancedDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseEnhancedDeleteDiamondProps = {}) {
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

    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Invalid diamond ID for deletion:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID format",
      });
      return false;
    }

    // Optimistic UI update - remove diamond immediately
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      console.log('🔄 Starting enhanced delete for diamond:', diamondId);
      
      // First, try FastAPI backend deletion
      const fastApiSuccess = await tryFastApiDeletion(diamondId, user.id);
      
      if (fastApiSuccess) {
        console.log('✅ FastAPI deletion successful');
        
        // Also delete from Supabase as backup sync
        await trySupabaseDeletion(diamondId, user.id);
        
        toast({
          title: "Success",
          description: "Diamond deleted successfully via FastAPI",
        });
        
        if (onSuccess) onSuccess();
        return true;
      }
      
      // If FastAPI fails, try direct Supabase deletion
      console.log('⚠️ FastAPI deletion failed, trying Supabase direct');
      const supabaseSuccess = await trySupabaseDeletion(diamondId, user.id);
      
      if (supabaseSuccess) {
        toast({
          title: "Success", 
          description: "Diamond deleted successfully via Supabase (backup method)",
        });
        
        if (onSuccess) onSuccess();
        return true;
      }
      
      // Both methods failed
      throw new Error('Both FastAPI and Supabase deletion methods failed');
      
    } catch (error) {
      console.error('❌ Enhanced delete failed:', error);
      
      // Restore diamond to state if deletion failed
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: errorMessage,
      });
      return false;
    }
  };

  return { deleteDiamond };
}

async function tryFastApiDeletion(diamondId: string, userId: number): Promise<boolean> {
  try {
    console.log('🚀 Attempting FastAPI deletion via /sold endpoint');
    
    const response = await api.post('/sold', {
      diamond_id: diamondId,
      user_id: userId,
      action: 'delete'
    });
    
    if (response.error) {
      console.error('FastAPI deletion error:', response.error);
      return false;
    }
    
    console.log('✅ FastAPI deletion successful');
    return true;
  } catch (error) {
    console.error('FastAPI deletion exception:', error);
    return false;
  }
}

async function trySupabaseDeletion(diamondId: string, userId: number): Promise<boolean> {
  try {
    console.log('🔄 Attempting Supabase direct deletion');
    
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', diamondId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase deletion error:', error);
      return false;
    }
    
    console.log('✅ Supabase deletion successful');
    return true;
  } catch (error) {
    console.error('Supabase deletion exception:', error);
    return false;
  }
}
