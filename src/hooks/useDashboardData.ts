
import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { testApiConnection } from '@/lib/api/config';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalInventory: number;
  totalValue: number;
  recentSales: number;
  pendingQueries: number;
  availableDiamonds: number;
  storeVisibleDiamonds: number;
  avgPricePerCarat: number;
  connectionStatus: 'healthy' | 'unhealthy' | 'testing';
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

interface DiamondData {
  id?: string;
  stock_number: string;
  shape: string;
  weight: number;
  carat: number;
  color: string;
  clarity: string;
  price: number;
  price_per_carat?: number;
  status: string;
  store_visible?: boolean;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'unhealthy' | 'testing'>('testing');
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchDashboardStats = async () => {
    if (!user?.id) return;
    
    try {
      console.log('📊 Fetching real diamond data from FastAPI for dashboard...');
      
      // Test connection first
      setConnectionHealth('testing');
      const isHealthy = await testApiConnection();
      setConnectionHealth(isHealthy ? 'healthy' : 'unhealthy');
      
      if (!isHealthy) {
        throw new Error('FastAPI server is not reachable');
      }

      // Fetch actual diamond data
      const response = await api.get(apiEndpoints.getAllStones(user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }

      let diamondData: DiamondData[] = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        diamondData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const dataObj = response.data as Record<string, any>;
        const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory'];
        
        for (const key of possibleArrayKeys) {
          if (Array.isArray(dataObj[key])) {
            diamondData = dataObj[key];
            break;
          }
        }
      }

      console.log('📊 Dashboard: Processing', diamondData.length, 'diamonds from FastAPI');

      // Calculate real statistics from FastAPI data
      const totalInventory = diamondData.length;
      const availableDiamonds = diamondData.filter(d => d.status === 'Available').length;
      const storeVisibleDiamonds = diamondData.filter(d => d.store_visible !== false).length;
      
      const totalValue = diamondData.reduce((sum, diamond) => {
        const price = diamond.price || (diamond.price_per_carat && diamond.weight ? diamond.price_per_carat * diamond.weight : 0);
        return sum + price;
      }, 0);

      const totalCarats = diamondData.reduce((sum, diamond) => sum + (diamond.weight || diamond.carat || 0), 0);
      const avgPricePerCarat = totalCarats > 0 ? Math.round(totalValue / totalCarats) : 0;

      const calculatedStats: DashboardStats = {
        totalClients: 0, // This would come from a separate endpoint
        activeClients: 0,
        totalInventory,
        totalValue: Math.round(totalValue),
        recentSales: 0, // This would come from sales data
        pendingQueries: 0,
        availableDiamonds,
        storeVisibleDiamonds,
        avgPricePerCarat,
        connectionStatus: 'healthy'
      };

      setStats(calculatedStats);
      console.log('✅ Dashboard: Real stats calculated from FastAPI data:', calculatedStats);

    } catch (error) {
      console.error('❌ Error fetching dashboard data from FastAPI:', error);
      setConnectionHealth('unhealthy');
      
      toast({
        title: "FastAPI Connection Error",
        description: "Unable to fetch real data from your diamond database. Using fallback data.",
        variant: "destructive",
      });

      // Fallback stats when FastAPI is not available
      setStats({
        totalClients: 0,
        activeClients: 0,
        totalInventory: 0,
        totalValue: 0,
        recentSales: 0,
        pendingQueries: 0,
        availableDiamonds: 0,
        storeVisibleDiamonds: 0,
        avgPricePerCarat: 0,
        connectionStatus: 'unhealthy'
      });
    }
  };

  const fetchClients = async () => {
    try {
      console.log('👥 Fetching clients from FastAPI...');
      const response = await api.get(apiEndpoints.getAllClients());
      
      if (response.error) {
        throw new Error(response.error);
      }

      setClients(response.data as Client[]);
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      setClients([]);
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
    connectionHealth,
    refetch,
  };
}
