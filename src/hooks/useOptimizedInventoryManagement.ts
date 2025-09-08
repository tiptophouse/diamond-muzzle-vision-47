// Optimized Inventory Management Hook combining all CRUD operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTelegramHaptics } from '@/hooks/useTelegramSDK';
import type { Database } from '@/integrations/supabase/types';

type Diamond = Database['public']['Tables']['diamonds']['Row'];
type DiamondInsert = Database['public']['Tables']['diamonds']['Insert'];
type DiamondUpdate = Database['public']['Tables']['diamonds']['Update'];

export function useOptimizedInventoryManagement() {
  const queryClient = useQueryClient();
  const { notification, isAvailable } = useTelegramHaptics();

  // Get all diamonds
  const {
    data: diamonds,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory-diamonds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diamonds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add diamond mutation
  const addDiamond = useMutation({
    mutationFn: async (diamondData: DiamondInsert) => {
      const { data, error } = await supabase
        .from('diamonds')
        .insert(diamondData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newDiamond) => {
      if (isAvailable) notification('success');
      
      // Optimistic update
      queryClient.setQueryData(['inventory-diamonds'], (old: Diamond[] = []) => [
        newDiamond,
        ...old
      ]);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['store-diamonds'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });

      toast.success('Stone added successfully', {
        description: `Diamond (${newDiamond.carat}ct) added to inventory.`
      });
    },
    onError: (error) => {
      if (isAvailable) notification('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add stone';
      toast.error('Failed to add stone', { description: errorMessage });
    }
  });

  // Update diamond mutation  
  const updateDiamond = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DiamondUpdate }) => {
      const { data, error } = await supabase
        .from('diamonds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedDiamond) => {
      if (isAvailable) notification('success');
      
      // Optimistic update
      queryClient.setQueryData(['inventory-diamonds'], (old: Diamond[] = []) =>
        old.map(diamond => 
          diamond.id === updatedDiamond.id ? updatedDiamond : diamond
        )
      );
      
      // Update individual diamond cache
      queryClient.setQueryData(['diamond', updatedDiamond.id], updatedDiamond);

      toast.success('Stone updated successfully');
    },
    onError: (error) => {
      if (isAvailable) notification('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update stone';
      toast.error('Failed to update stone', { description: errorMessage });
    }
  });

  // Delete diamond mutation
  const deleteDiamond = useMutation({
    mutationFn: async (diamondId: string) => {
      const { error } = await supabase
        .from('diamonds')
        .delete()
        .eq('id', diamondId);

      if (error) throw error;
      return diamondId;
    },
    onSuccess: (deletedId) => {
      if (isAvailable) notification('success');
      
      // Optimistic update
      queryClient.setQueryData(['inventory-diamonds'], (old: Diamond[] = []) =>
        old.filter(diamond => diamond.id !== deletedId)
      );
      
      // Remove individual diamond cache
      queryClient.removeQueries({ queryKey: ['diamond', deletedId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['store-diamonds'] });

      toast.success('Stone deleted successfully', {
        description: 'The stone has been removed from your inventory.'
      });
    },
    onError: (error) => {
      if (isAvailable) notification('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete stone';
      toast.error('Failed to delete stone', { description: errorMessage });
    }
  });

  return {
    // Data
    diamonds: diamonds || [],
    isLoading,
    error,

    // Actions
    addDiamond: addDiamond.mutate,
    updateDiamond: updateDiamond.mutate,
    deleteDiamond: deleteDiamond.mutate,
    refetch,

    // Status
    isAdding: addDiamond.isPending,
    isUpdating: updateDiamond.isPending,
    isDeleting: deleteDiamond.isPending,

    // Advanced
    addDiamondAsync: addDiamond.mutateAsync,
    updateDiamondAsync: updateDiamond.mutateAsync,
    deleteDiamondAsync: deleteDiamond.mutateAsync
  };
}