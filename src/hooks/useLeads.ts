
import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'converted';
  value: number;
  source: string;
  created_at: string;
}

export function useLeads() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Simulate loading leads data
    setIsLoading(true);
    setTimeout(() => {
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1234567890',
          status: 'active',
          value: 15000,
          source: 'website',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          status: 'converted',
          value: 25000,
          source: 'referral',
          created_at: new Date().toISOString()
        }
      ];
      setLeads(mockLeads);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated, user]);

  return {
    leads,
    isLoading,
  };
}
