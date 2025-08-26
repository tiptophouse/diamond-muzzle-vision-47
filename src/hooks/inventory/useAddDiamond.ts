
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';

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
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: string;
  certificate_comment?: string;
  rapnet?: number;
  price_per_carat: number;
  picture?: string;
}

interface AddDiamondResponse {
  id?: string | number;
  stock?: string;
  stock_number?: string;
  diamond_id?: string | number;
  message?: string;
}

export function useAddDiamond() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addDiamond = async (diamondData: DiamondCreateData): Promise<{ success: boolean; data?: any; error?: string }> => {
    setIsLoading(true);
    setError(null);

    const userId = getCurrentUserId();
    if (!userId) {
      const errorMsg = 'User not authenticated';
      setError(errorMsg);
      toast({
        title: "❌ Authentication Error",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    }

    try {
      console.log('➕ Adding diamond via FastAPI:', diamondData);
      
      const response = await api.post(
        apiEndpoints.addDiamond(userId),
        diamondData
      );

      if (response.error) {
        throw new Error(response.error);
      }
      
      // Safely extract diamond ID with proper type checking
      const responseData = response.data as AddDiamondResponse;
      const diamondId = responseData?.id || responseData?.stock || responseData?.stock_number || responseData?.diamond_id || 'unknown';
      
      console.log('✅ Diamond added successfully:', diamondId);

      toast({
        title: "✅ Diamond Added",
        description: `Diamond ${diamondId} added to your inventory successfully`,
      });

      return { success: true, data: response.data };
    } catch (err: any) {
      console.error('❌ Error adding diamond:', err);
      const errorMessage = err.message || 'Failed to add diamond';
      setError(errorMessage);
      
      toast({
        title: "❌ Failed to Add Diamond",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    isLoading,
    error,
  };
}
