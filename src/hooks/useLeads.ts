
import { useState, useEffect } from 'react';
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
      // For now, use sample data since the table types aren't updated yet
      setLeads([
        {
          id: '1',
          customer_name: 'John Smith',
          customer_email: 'john@example.com',
          inquiry_type: 'engagement',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah@example.com',
          inquiry_type: 'anniversary',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
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
