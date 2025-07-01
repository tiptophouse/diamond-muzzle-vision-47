
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from '@/hooks/use-toast';
import { getCurrentUserId } from '@/lib/api';

export function useInventoryManagement() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();

  const deleteAllInventory = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setIsDeleting(true);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('diamonds')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stones'] });
      
      toast({
        title: "Success ✅",
        description: "All inventory has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to delete all inventory:', error);
      toast({
        variant: "destructive",
        title: "Error ❌",
        description: "Failed to delete inventory. Please try again.",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const updateAllInventory = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('diamonds')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stones'] });
      
      toast({
        title: "Success ✅",
        description: "All inventory has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to update all inventory:', error);
      toast({
        variant: "destructive",
        title: "Error ❌",
        description: "Failed to update inventory. Please try again.",
      });
    },
  });

  return {
    deleteAllInventory: deleteAllInventory.mutate,
    updateAllInventory: updateAllInventory.mutate,
    isDeleting,
    isDeletingAll: deleteAllInventory.isPending,
    isUpdatingAll: updateAllInventory.isPending,
  };
}
