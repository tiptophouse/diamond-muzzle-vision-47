import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { Diamond, Package, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { http } from '@/api/http';
import { MobileTelegramDashboard } from '@/components/dashboard/MobileTelegramDashboard';
import { FloatingAdminButton } from '@/components/admin/FloatingAdminButton';
import { INVENTORY_CHANGE_EVENT } from '@/hooks/inventory/useInventoryDataSync';

interface DashboardData {
  totalDiamonds: number;
  totalValue: number;
  diamonds: any[];
  loading: boolean;
  error: string | null;
}

export default function SimpleDashboard() {
  const { user, isAuthenticated } = useTelegramAuth();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    totalDiamonds: 0,
    totalValue: 0,
    diamonds: [],
    loading: true,
    error: null
  });

  // Configure Telegram back button
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log('📱 Dashboard: Setting up back button');
    navigation.showBackButton(() => {
      console.log('📱 Dashboard: Back button clicked');
      haptics.light();
      navigate('/');
    });

    return () => {
      console.log('📱 Dashboard: Hiding back button');
      navigation.hideBackButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  const fetchDashboardData = async () => {
    if (!user || !isAuthenticated) {
      setData(prev => ({ ...prev, loading: false, error: 'Not authenticated' }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔍 Simple Dashboard: Fetching data for user:', user.id);
      
      // Use the proper API client with JWT authentication
      const diamonds = await http<any[]>(`/api/v1/get_all_stones?user_id=${user.id}`, { method: 'GET' });
      
      console.log('✅ Simple Dashboard: Received', diamonds?.length || 0, 'diamonds');

      if (diamonds && Array.isArray(diamonds)) {
        const totalValue = diamonds.reduce((sum, diamond) => {
          const price = Number(diamond.price_per_carat || diamond.price || 0);
          const weight = Number(diamond.weight || diamond.carat || 0);
          return sum + (price * weight);
        }, 0);

        setData({
          totalDiamonds: diamonds.length,
          totalValue,
          diamonds: diamonds.slice(0, 5), // Show only first 5 for preview
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

  // Listen for inventory changes and refresh dashboard
  useEffect(() => {
    const handleInventoryChange = () => {
      console.log('📊 Dashboard: Inventory changed detected, refreshing data...');
      if (isAuthenticated && user) {
        fetchDashboardData();
      }
    };

    window.addEventListener(INVENTORY_CHANGE_EVENT, handleInventoryChange);
    return () => {
      window.removeEventListener(INVENTORY_CHANGE_EVENT, handleInventoryChange);
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    // Still show dashboard with limited data
    return (
      <>
        <MobileTelegramDashboard />
        <FloatingAdminButton className="bottom-6 right-6" />
      </>
    );
  }

  // Use the new mobile-optimized dashboard  
  return (
    <>
      <MobileTelegramDashboard />
      <FloatingAdminButton className="bottom-6 right-6" />
    </>
  );
}