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
 * Create a single diamond
 */
export function useCreateDiamond(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => diamondsApi.createDiamond(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(userId) });
      
      toast({
        title: 'יהלום נוסף בהצלחה',
        description: 'היהלום נוסף למלאי שלך',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בהוספת יהלום',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a diamond
 */
export function useUpdateDiamond(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ diamondId, data }: { diamondId: string; data: any }) =>
      diamondsApi.updateDiamond(diamondId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: diamondKeys.detail(variables.diamondId) });
      
      toast({
        title: 'יהלום עודכן בהצלחה',
        description: 'הפרטים של היהלום עודכנו',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בעדכון יהלום',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a diamond
 */
export function useDeleteDiamond(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (stockNumber: string) => diamondsApi.deleteDiamond(stockNumber),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(userId) });
      
      toast({
        title: 'יהלום נמחק בהצלחה',
        description: data.message || 'היהלום הוסר מהמלאי',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה במחיקת יהלום',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Create multiple diamonds in batch
 */
export function useCreateDiamondsBatch(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (diamonds: any[]) => diamondsApi.createDiamondsBatch(diamonds),
    onSuccess: (data, diamonds) => {
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(userId) });
      
      toast({
        title: 'יהלומים נוספו בהצלחה',
        description: `${diamonds.length} יהלומים נוספו למלאי`,
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
