
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { getCurrentUserId } from '@/lib/api';
import { api, apiEndpoints } from '@/lib/api';

export function useAddDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const userId = getCurrentUserId() || user.id;
      
      const diamondData = {
        user_id: userId,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status,
        picture: data.picture || '',
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || '',
        store_visible: data.storeVisible,
      };

      console.log('➕ Adding diamond via FastAPI:', diamondData);
      
      const endpoint = apiEndpoints.addDiamond();
      const result = await api.post(endpoint, diamondData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      console.log('✅ Diamond added successfully to FastAPI backend');
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to add diamond to FastAPI:', error);
      throw error;
    }
  };

  return { addDiamond };
}
