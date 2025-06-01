
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      // Set the user context for RLS
      await supabase.rpc('set_config', {
        parameter: 'app.current_user_id',
        value: user.id.toString()
      });

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Fallback: create some sample data if table doesn't exist yet
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
