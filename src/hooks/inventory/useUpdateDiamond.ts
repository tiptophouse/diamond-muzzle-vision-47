
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      console.error('❌ UPDATE HOOK: User not authenticated');
      toast({
        title: "❌ Authentication Required",
        description: "Please log in to update diamonds",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    console.log('📝 UPDATE HOOK: Starting enhanced diamond update');
    console.log('📝 UPDATE HOOK: Diamond ID:', diamondId);
    console.log('📝 UPDATE HOOK: Data:', data);

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

      console.log('📝 UPDATE HOOK: Calling enhanced update API...');
      
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
      
      console.log('📝 UPDATE HOOK: API response received:', response);
      
      if (error) {
        console.error('❌ UPDATE HOOK: API error:', error);
        toast({
          title: "❌ Update Failed",
          description: `Failed to update diamond: ${error.message}`,
          variant: "destructive",
        });
        throw new Error(error.message);
      }

      if (!response?.success) {
        console.error('❌ UPDATE HOOK: Operation failed:', response?.error);
        toast({
          title: "❌ Update Failed",
          description: response?.error || 'Failed to update diamond',
          variant: "destructive",
        });
        throw new Error(response?.error || 'Update operation failed');
      }

      console.log('✅ UPDATE HOOK: Diamond updated successfully');
      
      // Show success message
      toast({
        title: "Success ✅",
        description: response.message || `Diamond ${data.stockNumber} updated successfully`,
      });
      
      if (onSuccess) {
        console.log('✅ UPDATE HOOK: Calling success callback');
        onSuccess();
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ UPDATE HOOK: Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "❌ Update Failed",
        description: `Failed to update diamond: ${errorMessage}`,
        variant: "destructive",
      });
      
      throw new Error(`Update operation failed: ${errorMessage}`);
    }
  };

  return { updateDiamond };
}
