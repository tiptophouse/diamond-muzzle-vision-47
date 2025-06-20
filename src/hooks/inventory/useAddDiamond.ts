
import { useState } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useAddDiamond(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegramAuth();

  const addDiamond = async (data: DiamondFormData): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ User not authenticated');
      return false;
    }

    setIsLoading(true);
    console.log('➕ Adding diamond:', data);

    try {
      // Prepare the data for the API
      const diamondData = {
        ...data,
        user_id: user.id,
        // Ensure numeric values are properly converted
        carat: parseFloat(data.carat?.toString() || '0'),
        price: parseFloat(data.price?.toString() || '0'),
        certificateNumber: data.certificateNumber || undefined,
      };

      console.log('📤 Sending diamond data to API:', diamondData);
      
      const response = await api.post(apiEndpoints.addDiamond, diamondData);
      
      if (response.error) {
        console.error('❌ API Error:', response.error);
        throw new Error(response.error);
      }

      console.log('✅ Diamond added successfully:', response.data);
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to add diamond:', error);
      
      // Store in localStorage as fallback
      try {
        const existingData = localStorage.getItem('diamond_inventory');
        const inventory = existingData ? JSON.parse(existingData) : [];
        
        const newDiamond = {
          id: `temp_${Date.now()}`,
          stock_number: data.stockNumber,
          shape: data.shape,
          weight: parseFloat(data.carat?.toString() || '0'),
          color: data.color,
          clarity: data.clarity,
          cut: data.cut,
          price_per_carat: parseFloat(data.price?.toString() || '0'),
          user_id: user.id,
          status: data.status || 'Available',
          store_visible: true,
          created_at: new Date().toISOString()
        };
        
        inventory.push(newDiamond);
        localStorage.setItem('diamond_inventory', JSON.stringify(inventory));
        
        console.log('💾 Diamond saved to localStorage as fallback');
        
        if (onSuccess) {
          onSuccess();
        }
        
        return true;
      } catch (storageError) {
        console.error('❌ Failed to save to localStorage:', storageError);
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    isLoading,
  };
}
