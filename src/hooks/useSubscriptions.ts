
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchSubscriptions = async () => {
    if (!user?.id) return;
    
    try {
      // For now, use sample data since the table types aren't updated yet
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
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user?.id]);

  return {
    subscriptions,
    isLoading,
    refetch: fetchSubscriptions,
  };
}
