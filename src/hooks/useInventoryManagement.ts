
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from '@/hooks/use-toast';
import { api, apiEndpoints } from '@/lib/api';

export function useInventoryManagement() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useTelegramAuth();
  const queryClient = useQueryClient();

  const deleteAllInventory = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setIsDeleting(true);
      
      // Use FastAPI endpoint for deleting all inventory
      const endpoint = apiEndpoints.deleteAllInventory(user.id);
      const result = await api.delete(endpoint);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
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
      
      // Use FastAPI endpoint for updating all inventory
      const endpoint = apiEndpoints.updateAllInventory();
      const result = await api.put(endpoint, { user_id: user.id, updates });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
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
    deleteAllInventory: () => deleteAllInventory.mutate(),
    updateAllInventory: (data: Record<string, any>) => updateAllInventory.mutate(data),
    isDeleting,
    isDeletingAll: deleteAllInventory.isPending,
    isUpdatingAll: updateAllInventory.isPending,
    isLoading: deleteAllInventory.isPending || updateAllInventory.isPending,
  };
}
