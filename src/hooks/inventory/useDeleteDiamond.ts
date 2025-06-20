
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';

interface UseDeleteDiamondProps {
  onSuccess?: () => void;
}

export function useDeleteDiamond({ onSuccess }: UseDeleteDiamondProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const deleteDiamond = async (diamondId: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('🗑️ Starting delete operation for diamond:', diamondId);

    try {
      const response = await api.delete(apiEndpoints.deleteDiamond(diamondId));
      
      if (response.error) {
        console.error('❌ Delete API Error:', response.error);
        
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: response.error,
        });
        
        return false;
      }

      console.log('✅ Diamond deleted successfully from FastAPI');
      
      toast({
        title: "Success",
        description: "Diamond deleted successfully",
      });
      
      // Trigger data refresh after successful deletion
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete diamond:', error);
      
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
