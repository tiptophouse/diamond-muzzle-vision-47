
import { useState } from 'react';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DiamondCreateData {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  certificate_number: number;
  lab?: string;
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  cut?: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: string;
  certificate_comment?: string;
  rapnet?: number;
  price_per_carat?: number;
  picture?: string;
}

export function useAddDiamond() {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const addDiamond = async (diamondData: DiamondCreateData): Promise<boolean> => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      toast({
        title: "❌ Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return false;
    }

    console.log('➕ ADD: Starting diamond creation:', {
      userId,
      diamondData,
      endpoint: apiEndpoints.addDiamond(userId)
    });

    setIsAdding(true);

    try {
      // Use the correct FastAPI POST endpoint with proper request body
      const response = await api.post(
        apiEndpoints.addDiamond(userId),
        diamondData
      );
      
      console.log('➕ ADD: FastAPI response:', response);

      if (response.error) {
        console.error('➕ ADD: FastAPI error:', response.error);
        toast({
          title: "❌ Add Failed",
          description: `Failed to add diamond: ${response.error}`,
          variant: "destructive",
        });
        return false;
      }
      
      console.log('✅ ADD: Diamond successfully created in FastAPI');
      
      // Also add to localStorage as fallback
      try {
        const localData = localStorage.getItem('diamond_inventory');
        const parsedData = localData ? JSON.parse(localData) : [];
        
        if (Array.isArray(parsedData)) {
          const newDiamond = {
            ...diamondData,
            id: response.data?.id || Date.now(),
            user_id: userId,
            created_at: new Date().toISOString()
          };
          
          parsedData.push(newDiamond);
          localStorage.setItem('diamond_inventory', JSON.stringify(parsedData));
          console.log('➕ ADD: Also added to localStorage');
        }
      } catch (localError) {
        console.warn('➕ ADD: Failed to update localStorage:', localError);
      }
      
      toast({
        title: "✅ Diamond Added",
        description: "Diamond has been successfully added to your inventory",
      });
      
      return true;
    } catch (error) {
      console.error('➕ ADD: Unexpected error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "❌ Add Failed",
        description: `Failed to add diamond: ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addDiamond,
    isAdding,
  };
}
