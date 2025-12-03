/**
 * React Query hooks for diamond management
 * Uses FastAPI endpoints with proper data transformation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as diamondsApi from '@/api/diamonds';
import { transformToFastAPICreate, transformToFastAPIUpdate } from '@/api/diamondTransformers';
import { apiEndpoints } from '@/lib/api/endpoints';
import { http } from '@/api/http';
import type { DiamondFormData } from '@/components/inventory/form/types';

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
      const endpoint = apiEndpoints.getAllStones();
      return http<any[]>(endpoint, { method: 'GET' });
    },
    enabled: !!userId,
  });
}

/**
 * Create a single diamond with optimistic updates and haptic feedback
 * Transforms frontend camelCase to FastAPI snake_case format
 */
export function useCreateDiamond() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ data, userId }: { data: DiamondFormData; userId: number }) => {
      console.log('💎 Creating diamond:', data.stockNumber);
      
      // Transform frontend form data to FastAPI format
      const transformedData = transformToFastAPICreate(data);
      console.log('📤 Transformed payload:', transformedData);
      
      return diamondsApi.createDiamond(transformedData);
    },
    onMutate: async ({ data, userId }) => {
      // Show loading toast
      toast({
        title: '⏳ מוסיף יהלום...',
        description: `מוסיף ${data.stockNumber} למלאי`,
      });
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });

      // Snapshot previous value
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));

      // Optimistically update
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) => {
        const newDiamond = {
          id: `temp-${Date.now()}`,
          stock_number: data.stockNumber,
          shape: data.shape,
          weight: data.carat,
          color: data.color,
          clarity: data.clarity,
          cut: data.cut,
          price: data.price,
          created_at: new Date().toISOString(),
        };
        return [newDiamond, ...old];
      });

      return { previousDiamonds };
    },
    onSuccess: (response, variables) => {
      console.log('✅ Diamond created successfully:', response);
      
      // Haptic success feedback
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: '✅ יהלום נוסף בהצלחה!',
        description: `${variables.data.stockNumber} נוסף למלאי שלך`,
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
        description: `${error.message || 'אנא נסה שוב'}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a diamond with optimistic updates and haptic feedback
 * Transforms frontend camelCase to FastAPI snake_case format
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
      data: Partial<DiamondFormData>;
      userId: number;
    }) => {
      console.log('✏️ Updating diamond:', diamondId);
      
      // Transform frontend form data to FastAPI format
      const transformedData = transformToFastAPIUpdate(data);
      console.log('📤 Transformed update payload:', transformedData);
      
      return diamondsApi.updateDiamond(diamondId, transformedData);
    },
    onMutate: async ({ diamondId, data, userId }) => {
      // Show loading toast
      toast({
        title: '⏳ מעדכן יהלום...',
        description: 'שומר שינויים',
      });
      
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });
      
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));
      
      // Optimistic update
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) =>
        old.map(diamond => 
          diamond.id === diamondId || diamond.diamond_id === diamondId
            ? { ...diamond, ...data, updated_at: new Date().toISOString() }
            : diamond
        )
      );
      
      return { previousDiamonds };
    },
    onSuccess: (response, variables) => {
      console.log('✅ Diamond updated successfully:', response);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: diamondKeys.detail(variables.diamondId.toString()) });
      
      toast({
        title: '✅ יהלום עודכן בהצלחה!',
        description: 'הפרטים של היהלום נשמרו',
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
        description: `${error.message || 'אנא נסה שוב'}`,
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
      // Show loading toast
      toast({
        title: '⏳ מוחק יהלום...',
        description: 'מסיר מהמלאי',
      });
      
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
    onSuccess: (response, variables) => {
      console.log('✅ Diamond deleted successfully:', response);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: '✅ יהלום נמחק בהצלחה!',
        description: response.message || 'היהלום הוסר מהמלאי',
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
        description: `${error.message || 'אנא נסה שוב'}`,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Create multiple diamonds in batch
 * Transforms each diamond to FastAPI format
 */
export function useCreateDiamondsBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ diamonds, userId }: { diamonds: DiamondFormData[]; userId: number }) => {
      console.log('📦 Batch creating diamonds:', diamonds.length);
      
      // Transform each diamond to FastAPI format
      const transformedDiamonds = diamonds.map(d => transformToFastAPICreate(d));
      console.log('📤 Transformed batch payload:', transformedDiamonds.length, 'diamonds');
      
      return diamondsApi.createDiamondsBatch(transformedDiamonds);
    },
    onMutate: () => {
      toast({
        title: '⏳ מעלה יהלומים...',
        description: 'מעבד את הקובץ',
      });
    },
    onSuccess: (response, variables) => {
      console.log('✅ Batch diamonds created:', response);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: '✅ יהלומים נוספו בהצלחה!',
        description: `${variables.diamonds.length} יהלומים נוספו למלאי`,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Batch creation failed:', error);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      toast({
        title: '❌ שגיאה בהעלאת יהלומים',
        description: `${error.message || 'אנא נסה שוב'}`,
        variant: 'destructive',
      });
    },
  });
}
