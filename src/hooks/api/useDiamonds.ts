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
    mutationFn: async ({ data, userId }: { data: any; userId: number }) => {
      console.log('💎 Creating diamond:', data.stockNumber || data.stock_number);
      
      // Transform data to FastAPI format
      const fastapiData = {
        stock: data.stockNumber || data.stock,
        shape: data.shape,
        weight: data.carat || data.weight,
        color: data.color,
        clarity: data.clarity,
        certificate_number: parseInt(data.certificateNumber || data.certificate_number || '0'),
        lab: data.lab || null,
        length: data.length || null,
        width: data.width || null,
        depth: data.depth || null,
        ratio: data.ratio || null,
        cut: data.cut || null,
        polish: data.polish || 'GOOD',
        symmetry: data.symmetry || 'GOOD',
        fluorescence: data.fluorescence || 'NONE',
        table: data.tablePercentage || data.table || 0,
        depth_percentage: data.depthPercentage || data.depth_percentage || 0,
        gridle: data.gridle || '',
        culet: data.culet || 'NONE',
        certificate_comment: data.certificateComment || data.certificate_comment || null,
        rapnet: data.rapnet || null,
        price_per_carat: data.pricePerCarat || data.price_per_carat || null,
        picture: data.picture || null,
      };
      
      return diamondsApi.createDiamond(fastapiData);
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
    mutationFn: async ({
      diamondId,
      data,
      userId,
    }: {
      diamondId: number;
      data: any;
      userId: number;
    }) => {
      console.log('✏️ Updating diamond ID:', diamondId);
      
      if (!diamondId || diamondId === 0) {
        throw new Error('Invalid diamond ID for update operation');
      }
      
      // Transform data to FastAPI format (only include changed fields)
      const fastapiData: any = {};
      
      if (data.stockNumber !== undefined) fastapiData.stock = data.stockNumber;
      if (data.shape !== undefined) fastapiData.shape = data.shape;
      if (data.carat !== undefined) fastapiData.weight = data.carat;
      if (data.color !== undefined) fastapiData.color = data.color;
      if (data.clarity !== undefined) fastapiData.clarity = data.clarity;
      if (data.certificateNumber !== undefined) fastapiData.certificate_number = parseInt(data.certificateNumber);
      if (data.lab !== undefined) fastapiData.lab = data.lab || null;
      if (data.length !== undefined) fastapiData.length = data.length || null;
      if (data.width !== undefined) fastapiData.width = data.width || null;
      if (data.depth !== undefined) fastapiData.depth = data.depth || null;
      if (data.ratio !== undefined) fastapiData.ratio = data.ratio || null;
      if (data.cut !== undefined) fastapiData.cut = data.cut || null;
      if (data.polish !== undefined) fastapiData.polish = data.polish || null;
      if (data.symmetry !== undefined) fastapiData.symmetry = data.symmetry || null;
      if (data.fluorescence !== undefined) fastapiData.fluorescence = data.fluorescence || null;
      if (data.tablePercentage !== undefined) fastapiData.table = data.tablePercentage || null;
      if (data.depthPercentage !== undefined) fastapiData.depth_percentage = data.depthPercentage || null;
      if (data.gridle !== undefined) fastapiData.gridle = data.gridle || null;
      if (data.culet !== undefined) fastapiData.culet = data.culet || null;
      if (data.certificateComment !== undefined) fastapiData.certificate_comment = data.certificateComment || null;
      if (data.rapnet !== undefined) fastapiData.rapnet = data.rapnet || null;
      if (data.pricePerCarat !== undefined) fastapiData.price_per_carat = data.pricePerCarat || null;
      if (data.picture !== undefined) fastapiData.picture = data.picture || null;
      if (data.storeVisible !== undefined) fastapiData.store_visible = data.storeVisible;
      
      return diamondsApi.updateDiamond(diamondId, fastapiData);
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
    mutationFn: async ({ diamondId, userId }: { diamondId: number; userId: number }) => {
      console.log('🗑️ Deleting diamond ID:', diamondId);
      
      if (!diamondId || diamondId === 0) {
        throw new Error('Invalid diamond ID for delete operation. Missing diamond_id from backend.');
      }
      
      return diamondsApi.deleteDiamond(diamondId);
    },
    onMutate: async ({ diamondId, userId }) => {
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });
      
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));
      
      // Optimistic delete
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) =>
        old.filter(diamond => 
          diamond.id !== diamondId && diamond.diamond_id !== diamondId
        )
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
