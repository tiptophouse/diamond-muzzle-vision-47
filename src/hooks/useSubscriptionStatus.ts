
import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api, apiEndpoints } from '@/lib/api';

interface SubscriptionStatus {
  isActive: boolean;
  planName?: string;
  expiresAt?: string;
  features?: string[];
}

export function useSubscriptionStatus() {
  const { user } = useTelegramAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ isActive: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from FastAPI first
        const endpoint = `/api/v1/users/${user.id}/subscription`;
        const response = await api.get<SubscriptionStatus>(endpoint);

        if (response.error) {
          console.warn('FastAPI subscription check failed, using fallback:', response.error);
          // Fallback: Check localStorage or assume active for development
          const fallbackStatus = localStorage.getItem(`subscription_${user.id}`);
          if (fallbackStatus) {
            setSubscriptionStatus(JSON.parse(fallbackStatus));
          } else {
            // For development: assume active subscription
            setSubscriptionStatus({
              isActive: true,
              planName: 'Professional',
              features: ['store_management', 'unlimited_diamonds', 'advanced_analytics']
            });
          }
        } else {
          setSubscriptionStatus(response.data || { isActive: false });
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setError('Failed to check subscription status');
        
        // Fallback for development
        setSubscriptionStatus({
          isActive: true,
          planName: 'Professional (Dev)',
          features: ['store_management', 'unlimited_diamonds', 'advanced_analytics']
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user?.id]);

  const hasFeature = (feature: string): boolean => {
    return subscriptionStatus.features?.includes(feature) || false;
  };

  return {
    subscriptionStatus,
    isLoading,
    error,
    hasFeature,
    isSubscribed: subscriptionStatus.isActive
  };
}
