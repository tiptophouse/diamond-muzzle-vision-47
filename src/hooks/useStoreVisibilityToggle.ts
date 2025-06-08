
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

export function useStoreVisibilityToggle() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleStoreVisibility = async (diamond: Diamond): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newVisibility = !(diamond as any).store_visible;
      
      const { error } = await supabase
        .from('inventory')
        .update({ store_visible: newVisibility })
        .eq('id', diamond.id);

      if (error) {
        console.error('Error updating store visibility:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update store visibility",
        });
        return false;
      }

      toast({
        title: "Store visibility updated",
        description: `Diamond ${newVisibility ? 'added to' : 'removed from'} store`,
      });

      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleStoreVisibility,
    isLoading,
  };
}
