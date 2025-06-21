
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { getCurrentUserId } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

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

      console.log('➕ Adding diamond via edge function:', diamondData);
      
      const { data: response, error } = await supabase.functions.invoke('diamond-management', {
        method: 'POST',
        body: diamondData,
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'add',
          'x-user_id': userId.toString()
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to add diamond');
      }

      console.log('✅ Diamond added successfully via edge function');
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to add diamond via edge function:', error);
      throw error;
    }
  };

  return { addDiamond };
}
