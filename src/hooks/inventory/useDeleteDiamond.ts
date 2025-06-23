
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { Diamond } from '@/types/diamond';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useDeleteDiamond({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseDeleteDiamondProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond): Promise<boolean> => {
    setIsLoading(true);
    console.log('🗑️ Starting delete operation for diamond:', diamondId);

    // Optimistically remove from UI
    if (removeDiamondFromState) {
      removeDiamondFromState(diamondId);
    }

    try {
      const response = await api.delete(apiEndpoints.deleteDiamond(diamondId));
      
      if (response.error) {
        console.error('❌ Delete API Error:', response.error);
        
        // Restore diamond to state on error
        if (restoreDiamondToState && diamondData) {
          restoreDiamondToState(diamondData);
        }
        
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: response.error,
        });
        
        return false;
      }

      console.log('✅ Diamond deleted successfully');
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete diamond:', error);
      
      // Restore diamond to state on error
      if (restoreDiamondToState && diamondData) {
        restoreDiamondToState(diamondData);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete diamond';
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: errorMessage,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteDiamond,
    isLoading,
  };
}
