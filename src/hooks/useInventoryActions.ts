
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface DiamondData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status?: string;
  imageUrl?: string;
}

export function useInventoryActions() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [loading, setLoading] = useState(false);

  const addDiamond = async (diamondData: DiamondData): Promise<boolean> => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "User not authenticated",
      });
      return false;
    }

    setLoading(true);
    
    try {
      console.log('💎 Adding diamond:', diamondData);

      // Validate required fields
      if (!diamondData.stockNumber || !diamondData.shape || !diamondData.carat) {
        throw new Error('Stock number, shape, and carat are required');
      }

      const payload = {
        user_id: user.id,
        diamonds: [{
          ...diamondData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          weight: diamondData.carat,
          price_per_carat: diamondData.carat > 0 ? Math.round(diamondData.price / diamondData.carat) : 0,
          stock_number: diamondData.stockNumber,
          status: diamondData.status || 'Available',
          picture: diamondData.imageUrl || null,
        }]
      };

      console.log('💎 Sending payload:', payload);

      const response = await api.post('/api/v1/upload-inventory', payload);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "✅ Success",
        description: `Diamond ${diamondData.stockNumber} added successfully!`,
      });

      console.log('✅ Diamond added successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to add diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to add diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "❌ Add Failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addDiamond,
    loading,
  };
}
