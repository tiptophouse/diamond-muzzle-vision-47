/**
 * React Query hook for checking active subscription status
 * Uses the JWT-authenticated endpoint for secure subscription validation
 */

import { useQuery } from '@tanstack/react-query';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { http } from '@/api/http';

interface SubscriptionResponse {
  has_active_subscription: boolean;
  message: string;
}

/**
 * Check if the authenticated user has an active subscription
 * Uses JWT from auth context - no user_id needed in request
 */
export function useActiveSubscription() {
  const { user, isAuthenticated } = useTelegramAuth();

  return useQuery({
    queryKey: ['active-subscription', user?.id],
    queryFn: async () => {
      console.log('🔐 Checking active subscription (JWT-authenticated)');
      
      const data = await http<SubscriptionResponse>('/api/v1/user/active-subscription', {
        method: 'GET'
      });
      
      console.log('✅ Subscription status:', data.has_active_subscription);
      return data;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Check if user has access (subscription or admin)
 */
export function useHasAccess() {
  const { data: subscription, isLoading } = useActiveSubscription();
  
  // Check if user is admin (you might have a separate hook for this)
  // const isAdmin = useIsAdmin();
  
  return {
    hasAccess: subscription?.has_active_subscription || false, // || isAdmin
    isLoading,
    subscription,
  };
}
