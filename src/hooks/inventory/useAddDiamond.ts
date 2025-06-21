
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { getCurrentUserId } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useAddDiamond(onSuccess?: () => void) {
  const { user } = useTelegramAuth();

  const addDiamond = async (data: DiamondFormData) => {
    if (!user?.id) {
      console.error('❌ ADD HOOK: User not authenticated');
      toast({
        title: "❌ Authentication Required",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    console.log('➕ ADD HOOK: Starting enhanced diamond creation');
    console.log('➕ ADD HOOK: Data:', data);

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

      console.log('➕ ADD HOOK: Calling enhanced add API...');
      
      const { data: response, error } = await supabase.functions.invoke('diamond-management', {
        method: 'POST',
        body: diamondData,
        headers: {
          'Content-Type': 'application/json',
          'x-action': 'add',
          'x-user_id': userId.toString()
        }
      });
      
      console.log('➕ ADD HOOK: API response received:', response);
      
      if (error) {
        console.error('❌ ADD HOOK: API error:', error);
        toast({
          title: "❌ Add Failed",
          description: `Failed to add diamond: ${error.message}`,
          variant: "destructive",
        });
        throw new Error(error.message);
      }

      if (!response?.success) {
        console.error('❌ ADD HOOK: Operation failed:', response?.error);
        toast({
          title: "❌ Add Failed",
          description: response?.error || 'Failed to add diamond',
          variant: "destructive",
        });
        throw new Error(response?.error || 'Add operation failed');
      }

      console.log('✅ ADD HOOK: Diamond added successfully');
      
      // Show success message
      toast({
        title: "Success ✅",
        description: response.message || `Diamond ${data.stockNumber} added successfully`,
      });
      
      if (onSuccess) {
        console.log('✅ ADD HOOK: Calling success callback');
        onSuccess();
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ ADD HOOK: Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "❌ Add Failed",
        description: `Failed to add diamond: ${errorMessage}`,
        variant: "destructive",
      });
      
      throw new Error(`Add operation failed: ${errorMessage}`);
    }
  };

  return { addDiamond };
}
