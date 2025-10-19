import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';

export interface DiamondData {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  price_per_carat?: number;
  status?: string;
  picture?: string;
  certificate_url?: string;
  certificate_number?: number;
}

export function useDiamondManagement(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { haptics } = useEnhancedTelegramWebApp();

  // Delete stone mutation with optimistic update
  const deleteStone = useMutation({
    mutationFn: async (stockNumber: string) => {
      const { data, error } = await supabase
        .from('inventory')
        .delete()
        .eq('stock_number', stockNumber)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    onMutate: async (stockNumber) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['diamonds', userId] });

      // Snapshot the previous value
      const previousDiamonds = queryClient.getQueryData(['diamonds', userId]);

      // Optimistically update - remove the diamond immediately
      queryClient.setQueryData(['diamonds', userId], (old: any) => {
        if (!old) return old;
        return old.filter((d: any) => d.stock_number !== stockNumber);
      });

      haptics?.light();

      return { previousDiamonds };
    },
    onError: (err, stockNumber, context) => {
      // Roll back on error
      queryClient.setQueryData(['diamonds', userId], context?.previousDiamonds);
      
      toast({
        title: 'Failed to delete stone',
        description: err.message,
        variant: 'destructive',
      });
      haptics?.error();
    },
    onSuccess: () => {
      toast({
        title: 'Stone deleted successfully',
        variant: 'default',
      });
      haptics?.success();
      
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['diamonds', userId] });
    },
  });

  // Add stone mutation
  const addStone = useMutation({
    mutationFn: async (diamond: DiamondData) => {
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          ...diamond,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Stone added successfully',
        variant: 'default',
      });
      haptics?.success();
      queryClient.invalidateQueries({ queryKey: ['diamonds', userId] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to add stone',
        description: err.message,
        variant: 'destructive',
      });
      haptics?.error();
    },
  });

  // Update stone mutation
  const updateStone = useMutation({
    mutationFn: async ({ stockNumber, data }: { stockNumber: string; data: Partial<DiamondData> }) => {
      const { data: result, error } = await supabase
        .from('inventory')
        .update(data)
        .eq('stock_number', stockNumber)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Stone updated successfully',
        variant: 'default',
      });
      haptics?.success();
      queryClient.invalidateQueries({ queryKey: ['diamonds', userId] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update stone',
        description: err.message,
        variant: 'destructive',
      });
      haptics?.error();
    },
  });

  return {
    deleteStone,
    addStone,
    updateStone,
  };
}
