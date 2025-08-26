
import { useState } from 'react';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Diamond } from '@/components/inventory/InventoryTable';

export function useDeleteDiamond() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteDiamond = async (
    diamondId: string, 
    optimisticRemove?: (id: string) => void,
    optimisticRestore?: (diamond: Diamond) => void,
    originalDiamond?: Diamond
  ) => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      toast({
        title: "❌ Authentication Error",
        description: "Please log in to delete diamonds",
        variant: "destructive",
      });
      return false;
    }

    // Convert string ID to number for FastAPI
    const numericDiamondId = parseInt(diamondId);
    if (isNaN(numericDiamondId)) {
      toast({
        title: "❌ Invalid Diamond ID",
        description: "Cannot delete diamond with invalid ID",
        variant: "destructive",
      });
      return false;
    }

    console.log('🗑️ DELETE: Starting diamond deletion:', {
      diamondId: numericDiamondId,
      userId,
      endpoint: apiEndpoints.deleteDiamond(numericDiamondId, userId)
    });

    setIsDeleting(true);

    // Optimistic UI update
    if (optimisticRemove) {
      optimisticRemove(diamondId);
    }

    try {
      // Use the correct FastAPI DELETE endpoint
      const response = await api.delete(apiEndpoints.deleteDiamond(numericDiamondId, userId));
      
      console.log('🗑️ DELETE: FastAPI response:', response);

      if (response.error) {
        console.error('🗑️ DELETE: FastAPI error:', response.error);
        
        // Restore diamond to UI on error
        if (optimisticRestore && originalDiamond) {
          optimisticRestore(originalDiamond);
        }
        
        toast({
          title: "❌ Delete Failed",
          description: `Failed to delete diamond: ${response.error}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Success - diamond is already removed from UI
      console.log('✅ DELETE: Diamond successfully deleted from FastAPI');
      
      // Also remove from localStorage as fallback
      try {
        const localData = localStorage.getItem('diamond_inventory');
        if (localData) {
          const parsedData = JSON.parse(localData);
          if (Array.isArray(parsedData)) {
            const updatedData = parsedData.filter(item => 
              String(item.id) !== diamondId && 
              String(item.diamond_id) !== diamondId
            );
            localStorage.setItem('diamond_inventory', JSON.stringify(updatedData));
            console.log('🗑️ DELETE: Also removed from localStorage');
          }
        }
      } catch (localError) {
        console.warn('🗑️ DELETE: Failed to update localStorage:', localError);
      }
      
      toast({
        title: "✅ Diamond Deleted",
        description: "Diamond has been successfully removed from your inventory",
      });
      
      return true;
    } catch (error) {
      console.error('🗑️ DELETE: Unexpected error:', error);
      
      // Restore diamond to UI on error
      if (optimisticRestore && originalDiamond) {
        optimisticRestore(originalDiamond);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "❌ Delete Failed",
        description: `Failed to delete diamond: ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDiamond,
    isDeleting,
  };
}
