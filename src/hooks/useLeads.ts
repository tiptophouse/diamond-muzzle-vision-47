
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
  const [isLoading, setIsLoading] = useState(false); // Changed to false
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchLeads = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For now, use safe sample data to prevent crashes
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
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
      console.warn('Leads fetch failed, using fallback:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add delay to prevent simultaneous calls
    const timer = setTimeout(() => {
      if (user?.id) {
        fetchLeads();
      }
    }, 1500); // Stagger after notifications

    return () => clearTimeout(timer);
  }, [user?.id]);

  return {
    leads,
    isLoading,
    refetch: fetchLeads,
  };
}
