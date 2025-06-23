
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { api, apiEndpoints } from '@/lib/api';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const updates = {
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: Number(data.carat),
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price: Number(data.price),
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status,
        store_visible: data.storeVisible,
        picture: data.picture || '',
        certificate_number: data.certificateNumber || '',
        certificate_url: data.certificateUrl || '',
        lab: data.lab || '',
      };

      console.log('📝 Updating diamond via FastAPI:', diamondId, updates);
      
      const endpoint = apiEndpoints.updateDiamond(diamondId);
      const result = await api.put(endpoint, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }

      console.log('✅ Diamond updated successfully in FastAPI backend');
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to update diamond in FastAPI:', error);
      throw error;
    }
  };

  return { updateDiamond };
}
