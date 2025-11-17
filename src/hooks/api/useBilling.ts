/**
 * React Query hooks for billing and subscription management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type {
  BillingResponse,
  UpdatePaymentMethodResponse,
  CancelSubscriptionResponse,
  PaymentMethodUpdate,
} from '@/types/backend-api';
import * as billingApi from '@/lib/api/billing';

// Query keys
export const billingKeys = {
  all: ['billing'] as const,
  details: () => [...billingKeys.all, 'details'] as const,
  activeSubscription: () => [...billingKeys.all, 'active-subscription'] as const,
};

/**
 * Get billing details for the authenticated user
 */
export function useGetBilling() {
  return useQuery({
    queryKey: billingKeys.details(),
    queryFn: billingApi.getBilling,
  });
}

/**
 * Get active subscription for the authenticated user
 */
export function useGetActiveSubscription() {
  return useQuery({
    queryKey: billingKeys.activeSubscription(),
    queryFn: billingApi.getActiveSubscription,
  });
}

/**
 * Cancel subscription mutation
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: billingApi.cancelSubscription,
    onSuccess: (data: CancelSubscriptionResponse) => {
      // Invalidate billing queries to refetch
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      
      toast({
        title: 'מנוי בוטל',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בביטול מנוי',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update payment method mutation
 */
export function useUpdatePaymentMethod() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: billingApi.updatePaymentMethod,
    onSuccess: (data: UpdatePaymentMethodResponse) => {
      if (data.success && data.payment_url) {
        // Redirect to payment page
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'שגיאה',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בעדכון אמצעי תשלום',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Trial subscription mutation
 */
export function useTrialSubscribe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: billingApi.trialSubscribe,
    onSuccess: (data: UpdatePaymentMethodResponse) => {
      if (data.success && data.payment_url) {
        // Redirect to payment page
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'שגיאה',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בהתחלת תקופת ניסיון',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Buy subscription mutation
 */
export function useBuySubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: billingApi.buySubscription,
    onSuccess: (data: UpdatePaymentMethodResponse) => {
      if (data.success && data.payment_url) {
        // Redirect to payment page
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'שגיאה',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה ברכישת מנוי',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Cancel subscription by user ID mutation
 */
export function useCancelSubscriptionByUserId() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: billingApi.cancelSubscriptionByUserId,
    onSuccess: (data: CancelSubscriptionResponse) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      
      toast({
        title: 'מנוי בוטל',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בביטול מנוי',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
