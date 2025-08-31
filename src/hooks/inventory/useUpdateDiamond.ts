
import { useState } from 'react';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Diamond } from '@/components/inventory/InventoryTable';

interface DiamondUpdateData {
  stock?: string;
  shape?: string;
  weight?: number;
  color?: string;
  clarity?: string;
  lab?: string;
  certificate_number?: number;
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  table?: number;
  depth_percentage?: number;
  gridle?: string;
  culet?: string;
  certificate_comment?: string;
  rapnet?: number;
  price_per_carat?: number;
  picture?: string;
}

export function useUpdateDiamond() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateDiamond = async (diamondId: string, updateData: DiamondUpdateData): Promise<boolean> => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      toast({
        title: "❌ Authentication Error",
        description: "Please log in to update diamonds",
        variant: "destructive",
      });
      return false;
    }

    // Convert string ID to number for FastAPI
    const numericDiamondId = parseInt(diamondId);
    if (isNaN(numericDiamondId)) {
      toast({
        title: "❌ Invalid Diamond ID",
        description: "Cannot update diamond with invalid ID",
        variant: "destructive",
      });
      return false;
    }

    console.log('✏️ UPDATE: Starting diamond update:', {
      diamondId: numericDiamondId,
      userId,
      updateData,
      endpoint: apiEndpoints.updateDiamond(numericDiamondId, userId)
    });

    setIsUpdating(true);

    try {
      // Use the correct FastAPI PUT endpoint with proper request body
      const response = await api.put(
        apiEndpoints.updateDiamond(numericDiamondId, userId),
        updateData
      );
      
      console.log('✏️ UPDATE: FastAPI response:', response);

      if (response.error) {
        console.error('✏️ UPDATE: FastAPI error:', response.error);
        toast({
          title: "❌ Update Failed",
          description: `Failed to update diamond: ${response.error}`,
          variant: "destructive",
        });
        return false;
      }
      
      console.log('✅ UPDATE: Diamond successfully updated in FastAPI');
      
      // Also update localStorage as fallback
      try {
        const localData = localStorage.getItem('diamond_inventory');
        if (localData) {
          const parsedData = JSON.parse(localData);
          if (Array.isArray(parsedData)) {
            const updatedData = parsedData.map(item => {
              if (String(item.id) === diamondId || String(item.diamond_id) === diamondId) {
                return { ...item, ...updateData };
              }
              return item;
            });
            localStorage.setItem('diamond_inventory', JSON.stringify(updatedData));
            console.log('✏️ UPDATE: Also updated in localStorage');
          }
        }
      } catch (localError) {
        console.warn('✏️ UPDATE: Failed to update localStorage:', localError);
      }
      
      toast({
        title: "✅ Diamond Updated",
        description: "Diamond has been successfully updated in your inventory",
      });
      
      return true;
    } catch (error) {
      console.error('✏️ UPDATE: Unexpected error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "❌ Update Failed",
        description: `Failed to update diamond: ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateDiamond,
    isUpdating,
  };
}
