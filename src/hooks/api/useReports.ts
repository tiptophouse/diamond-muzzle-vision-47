/**
 * React Query hooks for diamond reports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { DiamondReportSchema } from '@/types/backend-api';
import * as reportsApi from '@/lib/api/reports';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (diamondId: number) => [...reportKeys.details(), diamondId] as const,
};

/**
 * Get a diamond report
 */
export function useGetReport(diamondId: number) {
  return useQuery({
    queryKey: reportKeys.detail(diamondId),
    queryFn: () => reportsApi.getReport(diamondId),
    enabled: !!diamondId,
  });
}

/**
 * Create a diamond report mutation
 */
export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: reportsApi.createReport,
    onSuccess: (reportId: string) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      
      toast({
        title: 'דוח נוצר בהצלחה',
        description: `מזהה דוח: ${reportId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה ביצירת דוח',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
