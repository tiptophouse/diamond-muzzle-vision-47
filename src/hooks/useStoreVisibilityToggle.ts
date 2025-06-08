
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

export function useStoreVisibilityToggle() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleStoreVisibility = async (diamond: Diamond): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newVisibility = !(diamond as any).store_visible;
      
      console.log('Toggling store visibility for diamond:', diamond.id, 'to:', newVisibility);
      
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

      // Force a page refresh to ensure the store page shows updated data
      if (newVisibility) {
        // If publishing to store, also update the store cache by triggering a reload
        window.dispatchEvent(new CustomEvent('store-data-refresh'));
      }

      toast({
        title: newVisibility ? "✅ Published to Store" : "📦 Removed from Store",
        description: `Diamond ${diamond.stockNumber} ${newVisibility ? 'is now visible in your store' : 'has been removed from store'}`,
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
