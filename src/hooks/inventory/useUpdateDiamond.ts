
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { supabase } from '@/integrations/supabase/client';

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

      console.log('📝 Updating diamond via edge function:', diamondId, updates);
      
      const { data: response, error } = await supabase.functions.invoke('diamond-management', {
        method: 'PUT',
        body: updates,
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'update',
          'x-diamond_id': diamondId,
          'x-user_id': user.id.toString()
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to update diamond');
      }

      console.log('✅ Diamond updated successfully via edge function');
      
      if (onSuccess) onSuccess();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to update diamond via edge function:', error);
      throw error;
    }
  };

  return { updateDiamond };
}
