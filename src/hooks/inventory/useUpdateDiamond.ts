
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { isValidUUID } from '@/utils/diamondUtils';

export function useUpdateDiamond(onSuccess?: () => void) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    // Validate diamond ID format
    if (!diamondId || !isValidUUID(diamondId)) {
      console.error('Invalid diamond ID format:', diamondId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid diamond ID format. Please refresh and try again.",
      });
      return false;
    }

    try {
      console.log('Updating diamond ID:', diamondId, 'with data:', data);
      
      // Prepare update data with proper validation and type conversion
      const updateData = {
        stock_number: data.stockNumber?.toString() || '',
        shape: data.shape || 'Round',
        weight: Number(data.carat) || 1,
        color: data.color || 'G',
        clarity: data.clarity || 'VS1',
        cut: data.cut || 'Excellent',
        price_per_carat: data.carat > 0 ? Math.round(Number(data.price) / Number(data.carat)) : Math.round(Number(data.price)),
        status: data.status || 'Available',
        picture: data.picture || null,
        updated_at: new Date().toISOString(),
      };

      console.log('Supabase update data:', updateData);

      const { data: updatedData, error } = await supabase
        .from('inventory')
        .update(updateData)
        .eq('id', diamondId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        
        if (error.message.includes('invalid input syntax for type uuid')) {
          throw new Error('Invalid diamond ID format. Please refresh the page and try again.');
        } else if (error.message.includes('row-level security')) {
          throw new Error('You do not have permission to update this diamond.');
        } else if (error.message.includes('No rows found')) {
          throw new Error('Diamond not found. It may have been deleted.');
        } else {
          throw new Error(`Update failed: ${error.message}`);
        }
      }

      if (!updatedData) {
        throw new Error('Diamond not found or no changes were made');
      }

      console.log('Diamond updated successfully:', updatedData);
      
      toast({
        title: "Success",
        description: "Diamond updated successfully",
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Failed to update diamond:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update diamond. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return false;
    }
  };

  return { updateDiamond };
};
