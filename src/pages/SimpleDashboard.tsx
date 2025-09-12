import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api/client';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';

interface DashboardData {
  totalDiamonds: number;
  totalValue: number;
  diamonds: any[];
  loading: boolean;
  error: string | null;
}

export default function SimpleDashboard() {
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    totalDiamonds: 0,
    totalValue: 0,
    diamonds: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    if (!user || !isAuthenticated) {
      setData(prev => ({ ...prev, loading: false, error: 'Not authenticated' }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔍 Simple Dashboard: Fetching data for user:', user.id);
      
      // Use the proper API client with JWT authentication
      const response = await api.get<any[]>(`/api/v1/get_all_stones?user_id=${user.id}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const diamonds = response.data || [];
      console.log('✅ Simple Dashboard: Received', diamonds.length, 'diamonds');

      if (Array.isArray(diamonds)) {
        const totalValue = diamonds.reduce((sum, diamond) => {
          const price = Number(diamond.price_per_carat || diamond.price || 0);
          const weight = Number(diamond.weight || diamond.carat || 0);
          return sum + (price * weight);
        }, 0);

        setData({
          totalDiamonds: diamonds.length,
          totalValue,
          diamonds: diamonds, // Pass all diamonds to DataDrivenDashboard
          loading: false,
          error: null
        });

        toast({
          title: "Dashboard Updated",
          description: `Loaded ${diamonds.length} diamonds from your inventory`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Simple Dashboard: Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      // Only show toast for non-authentication errors (auth errors are handled by API client)
      if (!errorMessage.includes('JWT token') && !errorMessage.includes('Authentication')) {
        toast({
          variant: "destructive",
          title: "Failed to load dashboard",
          description: errorMessage,
        });
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated]); // Only run when authentication status changes

  // Show data even without authentication for better UX
  if (!isAuthenticated || !user) {
    return (
      <TelegramMiniAppLayout>
        <DataDrivenDashboard 
          allDiamonds={[]} 
          loading={false} 
          fetchData={() => {}} 
        />
      </TelegramMiniAppLayout>
    );
  }

  // Use the modern DataDrivenDashboard with proper layout
  return (
    <TelegramMiniAppLayout>
      <DataDrivenDashboard 
        allDiamonds={data.diamonds} 
        loading={data.loading} 
        fetchData={fetchDashboardData} 
      />
    </TelegramMiniAppLayout>
  );
}