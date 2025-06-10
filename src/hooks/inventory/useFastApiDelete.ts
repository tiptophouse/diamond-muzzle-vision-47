
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';
import { deleteDiamondViaFastApi } from '@/lib/api/fastApiClient';

interface UseFastApiDeleteProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useFastApiDelete({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseFastApiDeleteProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  // Helper function to extract numeric ID from diamond
  const extractNumericId = (diamond: Diamond): number | null => {
    // If diamond has a numeric ID in stockNumber, use that
    if (diamond.stockNumber && !isNaN(Number(diamond.stockNumber))) {
      return Number(diamond.stockNumber);
    }
    
    // If diamond has a certificateNumber, use that
    if (diamond.certificateNumber && !isNaN(Number(diamond.certificateNumber))) {
      return Number(diamond.certificateNumber);
    }
    
    // Try to extract ID from the UUID (take last digits)
    const uuidMatch = diamond.id.match(/(\d+)$/);
    if (uuidMatch) {
      return Number(uuidMatch[1]);
    }
    
    // Fallback: use hash of stockNumber as ID
    let hash = 0;
    const str = diamond.stockNumber || diamond.id;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const deleteDiamondFastApi = async (diamond: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    const numericId = extractNumericId(diamond);
    if (!numericId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not determine diamond ID for FastAPI deletion",
      });
      return false;
    }

    // Optimistic UI update - remove diamond immediately
    if (removeDiamondFromState) {
      removeDiamondFromState(diamond.id);
    }

    try {
      console.log('🗑️ Deleting diamond via FastAPI. Diamond:', diamond.stockNumber, 'Numeric ID:', numericId);
      
      const result = await deleteDiamondViaFastApi(numericId);
      
      toast({
        title: "Success",
        description: result.message || "Diamond deleted successfully via FastAPI",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('❌ Failed to delete diamond via FastAPI:', error);
      
      // Restore diamond to state if deletion failed
      if (restoreDiamondToState) {
        restoreDiamondToState(diamond);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond via FastAPI";
      
      // Handle specific FastAPI error cases
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        toast({
          variant: "destructive",
          title: "Diamond Not Found",
          description: "The diamond was not found on the FastAPI server. It may have already been deleted.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "FastAPI Error",
          description: errorMessage,
        });
      }
      
      return false;
    }
  };

  return { deleteDiamondFastApi };
}
