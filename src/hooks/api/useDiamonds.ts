/**
 * React Query hooks for diamond management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { DiamondCreateRequest, DiamondUpdateRequest } from '@/types/fastapi-models';
import * as diamondsApi from '@/api/diamonds';
import { apiEndpoints } from '@/lib/api/endpoints';
import { http } from '@/api/http';

// Query keys
export const diamondKeys = {
  all: ['diamonds'] as const,
  lists: () => [...diamondKeys.all, 'list'] as const,
  list: (userId: number) => [...diamondKeys.lists(), userId] as const,
  details: () => [...diamondKeys.all, 'detail'] as const,
  detail: (id: string) => [...diamondKeys.details(), id] as const,
};

/**
 * Get all stones for the authenticated user
 */
export function useGetAllStones(userId: number) {
  return useQuery({
    queryKey: diamondKeys.list(userId),
    queryFn: async () => {
      const endpoint = apiEndpoints.getAllStones(userId);
      return http<any[]>(endpoint, { method: 'GET' });
    },
    enabled: !!userId,
  });
}

/**
 * Create a single diamond with optimistic updates and haptic feedback
 */
export function useCreateDiamond() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ data, userId }: { data: any; userId: number }) => {
      console.log('💎 Creating diamond:', data.stockNumber || data.stock_number);
      return diamondsApi.createDiamond(data);
    },
    onMutate: async ({ data, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });

      // Snapshot previous value
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));

      // Optimistically update
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) => {
        const newDiamond = {
          id: `temp-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
        };
        return [newDiamond, ...old];
      });

      return { previousDiamonds };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Diamond created successfully:', data);
      
      // Haptic success feedback
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: '✅ יהלום נוסף בהצלחה',
        description: 'היהלום נוסף למלאי שלך',
      });
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Diamond creation failed:', error);
      
      // Haptic error feedback
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      // Rollback optimistic update
      if (context?.previousDiamonds) {
        queryClient.setQueryData(diamondKeys.list(variables.userId), context.previousDiamonds);
      }
      
      toast({
        title: '❌ שגיאה בהוספת יהלום',
        description: error.message || 'אנא נסה שוב',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a diamond with optimistic updates and haptic feedback
 */
export function useUpdateDiamond() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      diamondId,
      data,
      userId,
    }: {
      diamondId: number;
      data: any;
      userId: number;
    }) => {
      console.log('✏️ Updating diamond:', diamondId);
      return diamondsApi.updateDiamond(diamondId, data);
    },
    onMutate: async ({ diamondId, data, userId }) => {
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });
      
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));
      
      // Optimistic update
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) =>
        old.map(diamond => 
          diamond.id === diamondId || diamond.stock_number === diamondId
            ? { ...diamond, ...data, updated_at: new Date().toISOString() }
            : diamond
        )
      );
      
      return { previousDiamonds };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Diamond updated successfully');
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: diamondKeys.detail(variables.diamondId.toString()) });
      
      toast({
        title: '✅ יהלום עודכן בהצלחה',
        description: 'הפרטים של היהלום עודכנו',
      });
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Diamond update failed:', error);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      if (context?.previousDiamonds) {
        queryClient.setQueryData(diamondKeys.list(variables.userId), context.previousDiamonds);
      }
      
      toast({
        title: '❌ שגיאה בעדכון יהלום',
        description: error.message || 'אנא נסה שוב',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a diamond with optimistic updates and haptic feedback
 */
export function useDeleteDiamond() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ diamondId, userId }: { diamondId: number; userId: number }) => {
      console.log('🗑️ Deleting diamond ID:', diamondId);
      return diamondsApi.deleteDiamond(diamondId);
    },
    onMutate: async ({ diamondId, userId }) => {
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });
      
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));
      
      // Optimistic delete - match by numeric ID
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) =>
        old.filter(diamond => {
          const id = diamond.id || diamond.diamond_id;
          return id !== diamondId;
        })
      );
      
      return { previousDiamonds };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Diamond deleted successfully');
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: '✅ יהלום נמחק בהצלחה',
        description: data.message || 'היהלום הוסר מהמלאי',
      });
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Diamond deletion failed:', error);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      if (context?.previousDiamonds) {
        queryClient.setQueryData(diamondKeys.list(variables.userId), context.previousDiamonds);
      }
      
      toast({
        title: '❌ שגיאה במחיקת יהלום',
        description: error.message || 'אנא נסה שוב',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Create multiple diamonds in batch
 */
export function useCreateDiamondsBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ diamonds, userId }: { diamonds: any[]; userId: number }) =>
      diamondsApi.createDiamondsBatch(diamonds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: 'יהלומים נוספו בהצלחה',
        description: `${variables.diamonds.length} יהלומים נוספו למלאי`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בהוספת יהלומים',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
