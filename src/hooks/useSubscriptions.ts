
import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface Subscription {
  id: string;
  plan_name: string;
  status: 'active' | 'inactive' | 'cancelled';
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
}

export function useSubscriptions() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setTimeout(() => {
      const mockSubscriptions: Subscription[] = [
        {
          id: '1',
          plan_name: 'Premium',
          status: 'active',
          amount: 99,
          currency: 'USD',
          billing_cycle: 'monthly',
          start_date: new Date().toISOString(),
        }
      ];
      setSubscriptions(mockSubscriptions);
      setIsLoading(false);
    }, 800);
  }, [isAuthenticated, user]);

  return {
    subscriptions,
    isLoading,
  };
}
