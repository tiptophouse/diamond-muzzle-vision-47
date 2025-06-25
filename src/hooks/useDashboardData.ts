
import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalInventory: number;
  totalValue: number;
  recentSales: number;
  pendingQueries: number;
}

interface Client {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  status: string;
  last_active?: string;
  created_at: string;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchDashboardStats = async () => {
    if (!user?.id) return;
    
    try {
      console.log('📊 Fetching dashboard stats from FastAPI with JWT authentication...');
      const response = await api.get(apiEndpoints.getDashboardStats());
      
      if (response.error) {
        throw new Error(response.error);
      }

      setStats(response.data as DashboardStats);
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      // Fallback to default stats if FastAPI is not available
      setStats({
        totalClients: 0,
        activeClients: 0,
        totalInventory: 0,
        totalValue: 0,
        recentSales: 0,
        pendingQueries: 0
      });
    }
  };

  const fetchClients = async () => {
    try {
      console.log('👥 Fetching clients from FastAPI with JWT authentication...');
      const response = await api.get(apiEndpoints.getAllClients());
      
      if (response.error) {
        throw new Error(response.error);
      }

      setClients(response.data as Client[]);
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      toast({
        title: "Error loading clients",
        description: "Unable to fetch client data from server",
        variant: "destructive",
      });
      setClients([]); // Empty array if FastAPI unavailable
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDashboardStats(), fetchClients()]);
      setIsLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const refetch = async () => {
    await Promise.all([fetchDashboardStats(), fetchClients()]);
  };

  return {
    stats,
    clients,
    isLoading,
    refetch,
  };
}
