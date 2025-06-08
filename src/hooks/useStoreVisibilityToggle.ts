
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useStoreVisibilityToggle() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const toggleStoreVisibility = async (diamondId: string, currentVisibility: boolean) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ store_visible: !currentVisibility })
        .eq('id', diamondId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Diamond ${!currentVisibility ? 'added to' : 'removed from'} store`,
      });

      return true;
    } catch (error) {
      console.error('Failed to toggle store visibility:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update store visibility",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStoreVisibility, loading };
}
