
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';

interface AddDiamondData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
  store_visible?: boolean;
  certificateNumber?: string;
  lab?: string;
  certificateUrl?: string;
}

export function useAddDiamond() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { triggerInventoryChange } = useInventoryDataSync();

  const addDiamond = async (diamondData: AddDiamondData): Promise<boolean> => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.error('🚫 ADD DIAMOND: No authenticated user ID found');
      toast({
        variant: "destructive",
        title: "❌ Authentication Required",
        description: "You must be logged in to add diamonds to your inventory.",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log('💎 ADD DIAMOND: Adding diamond for user:', userId, diamondData);
      
      const endpoint = apiEndpoints.addDiamond(userId);
      const response = await api.post(endpoint, {
        user_id: userId,
        stock_number: diamondData.stockNumber,
        shape: diamondData.shape,
        weight: diamondData.carat,
        color: diamondData.color,
        clarity: diamondData.clarity,
        cut: diamondData.cut,
        price_per_carat: Math.round(diamondData.price / diamondData.carat),
        status: diamondData.status,
        picture: diamondData.imageUrl,
        store_visible: diamondData.store_visible !== false,
        certificate_number: diamondData.certificateNumber,
        lab: diamondData.lab,
        certificate_url: diamondData.certificateUrl,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ ADD DIAMOND: Successfully added diamond');
      
      toast({
        title: "✅ Diamond Added Successfully",
        description: `Stock #${diamondData.stockNumber} has been added to your inventory.`,
      });

      // Trigger inventory refresh
      triggerInventoryChange();
      
      return true;
    } catch (error) {
      console.error('❌ ADD DIAMOND: Failed to add diamond:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add diamond';
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Add Diamond",
        description: errorMessage,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    isLoading
  };
}
