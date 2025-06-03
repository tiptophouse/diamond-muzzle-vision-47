
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchSubscriptions = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Safe sample data to prevent crashes
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
      
      setSubscriptions([
        {
          id: '1',
          plan_name: 'Professional',
          status: 'active',
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
    } catch (error) {
      console.warn('Subscriptions fetch failed, using fallback:', error);
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add delay to prevent simultaneous calls
    const timer = setTimeout(() => {
      if (user?.id) {
        fetchSubscriptions();
      }
    }, 2000); // Stagger after leads

    return () => clearTimeout(timer);
  }, [user?.id]);

  return {
    subscriptions,
    isLoading,
    refetch: fetchSubscriptions,
  };
}
