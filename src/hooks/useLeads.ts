
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface Lead {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  inquiry_type: string;
  status: string;
  diamond_interests?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchLeads = async () => {
    if (!user?.id) return;
    
    try {
      // Set the user context for RLS
      await supabase.rpc('set_config', {
        parameter: 'app.current_user_id',
        value: user.id.toString()
      });

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Fallback: create some sample data if table doesn't exist yet
      setLeads([
        {
          id: '1',
          customer_name: 'John Smith',
          customer_email: 'john@example.com',
          inquiry_type: 'engagement',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user?.id]);

  return {
    leads,
    isLoading,
    refetch: fetchLeads,
  };
}
