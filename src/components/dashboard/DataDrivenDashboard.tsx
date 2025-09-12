// Enhanced Dashboard with modern Telegram-native design  
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { RealTimeUserCount } from '@/components/dashboard/RealTimeUserCount';
import { NotificationHeatMapSection } from '@/components/dashboard/NotificationHeatMapSection';
import { ModernStatsGrid, defaultDashboardStats } from '@/components/dashboard/ModernStatsGrid';
import { EnhancedDashboardContent } from '@/components/dashboard/EnhancedDashboardContent';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useEffect, useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useNavigate } from 'react-router-dom';
import { Gem, TrendingUp, Plus, Upload, Activity, Users2, ArrowRight, Package, BarChart3 } from 'lucide-react';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { safeDivide, safeSum, safeRound, validateDiamondData } from '@/utils/safeMath';
import { useDiamondDistribution } from '@/hooks/useDiamondDistribution';
import { ColorDistributionChart } from '@/components/charts/ColorDistributionChart';
import { ClarityDistributionChart } from '@/components/charts/ClarityDistributionChart';
import { RecentDiamondsSection } from '@/components/charts/RecentDiamondsSection';
import { cn } from '@/lib/utils';

interface DataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function DataDrivenDashboard({ allDiamonds, loading, fetchData }: DataDrivenDashboardProps) {
  const { user } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const { webApp, haptics } = useEnhancedTelegramWebApp();
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();
  const navigate = useNavigate();
  const { notifications } = useFastApiNotifications();
  
  // Fetch distribution data from FastAPI
  const { data: distributionData, loading: distributionLoading, refetch: refetchDistribution } = useDiamondDistribution();

  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds?.length || 0);

  // Set Telegram WebApp theme with error handling
  useEffect(() => {
    try {
      if (webApp) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor || '#f8fafc');
        document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams?.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams?.button_color || '#0088cc');
      }
    } catch (error) {
      console.error('❌ Dashboard: WebApp theme setup failed:', error);
    }
  }, [webApp]);

  // Listen for inventory changes with error handling
  useEffect(() => {
    try {
      const unsubscribe = subscribeToInventoryChanges(() => {
        console.log('🔄 Dashboard: Inventory changed detected, refreshing dashboard data...');
        try {
          fetchData();
        } catch (error) {
          console.error('❌ Dashboard: Failed to refresh data:', error);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Dashboard: Failed to subscribe to inventory changes:', error);
      return () => {}; // Return noop function
    }
  }, [subscribeToInventoryChanges, fetchData]);

  // Safe data processing with comprehensive error handling
  const { validDiamonds, processedData } = useMemo(() => {
    try {
      // Ensure allDiamonds is an array
      const diamondsArray = Array.isArray(allDiamonds) ? allDiamonds : [];
      console.log('🔍 Dashboard: Processing', diamondsArray.length, 'diamonds');
      
      // Filter valid diamonds with safe validation
      const valid = diamondsArray.filter(diamond => {
        try {
          return validateDiamondData(diamond);
        } catch (error) {
          console.warn('❌ Dashboard: Invalid diamond data:', diamond, error);
          return false;
        }
      });
      
      console.log('🔍 Dashboard: Found', valid.length, 'valid diamonds');

      // Process our own stats instead of using processDiamondDataForDashboard
      let processed = { 
        stats: { 
          totalDiamonds: valid.length, 
          matchedPairs: 0, 
          totalLeads: 0, 
          avgPricePerCarat: 0,
          totalValue: 0,
          availableDiamonds: 0,
        } 
      };
      
      // We'll calculate our stats directly in the component
      console.log('✅ Dashboard: Using direct stats calculation for', valid.length, 'diamonds');

      return { validDiamonds: valid, processedData: processed };
    } catch (error) {
      console.error('❌ Dashboard: Critical error in data processing:', error);
      return { validDiamonds: [], processedData: null };
    }
  }, [allDiamonds]);

  // Safe navigation handlers with haptic feedback
  const handleNavigate = (path: string) => {
    try {
      selectionChanged();
      navigate(path);
    } catch (error) {
      console.error('❌ Dashboard: Navigation failed:', error);
    }
  };

  const handleButtonClick = (path: string) => {
    try {
      impactOccurred('medium');
      navigate(path);
    } catch (error) {
      console.error('❌ Dashboard: Button click failed:', error);
    }
  };

  // Safe calculations with fallbacks
  const totalValue = safeSum(validDiamonds.map(d => {
    try {
      const total = Number(d.price) || 0;
      return isFinite(total) ? total : 0;
    } catch {
      return 0;
    }
  }));

  const availableDiamonds = validDiamonds.filter(d => {
    try {
      const status = d.status?.toLowerCase();
      return status === 'available' || status === 'in stock' || !status;
    } catch {
      return false;
    }
  }).length;

  const avgPricePerCarat = safeDivide(
    safeSum(validDiamonds.map(d => {
      try {
        const price = Number(d.price) || 0;
        const carat = Number(d.carat) || 0;
        return isFinite(price) && isFinite(carat) && carat > 0 ? safeDivide(price, carat) : 0;
      } catch {
        return 0;
      }
    })),
    validDiamonds.length
  );

  // Always show dashboard - no welcome screen
  // Show empty state data but keep dashboard structure

  // Modern dashboard stats
  const statsData = defaultDashboardStats({
    totalDiamonds: validDiamonds.length,
    totalValue: totalValue,
    availableCount: availableDiamonds,
    avgPricePerCarat: avgPricePerCarat || 0
  });

  return (
    <EnhancedDashboardContent onNavigate={handleNavigate}>
      {/* Modern Stats Grid */}
      <ModernStatsGrid stats={statsData} />

      {/* Real-time Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-0 shadow-lg bg-card/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Live Activity</h3>
              <p className="text-sm text-muted-foreground">Real-time user engagement</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <RealTimeUserCount />
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-card/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Activity heatmap</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <NotificationHeatMapSection />
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-lg bg-card/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Color Distribution</h3>
              <p className="text-sm text-muted-foreground">Inventory breakdown by color</p>
            </div>
          </div>
          <ColorDistributionChart 
            distribution={distributionData?.colorDistribution || []} 
            isLoading={distributionLoading}
          />
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-card/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Clarity Analysis</h3>
              <p className="text-sm text-muted-foreground">Quality distribution</p>
            </div>
          </div>
          <ClarityDistributionChart 
            distribution={distributionData?.clarityDistribution || []} 
            isLoading={distributionLoading}
          />
        </Card>
      </div>

      {/* Inventory Chart */}
      <Card className="p-6 border-0 shadow-lg bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Shape Distribution</h3>
            <p className="text-sm text-muted-foreground">Inventory analysis by diamond shape</p>
          </div>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <InventoryChart 
          title="Shape Distribution" 
          data={validDiamonds.map(d => ({ 
            name: d.shape || 'Unknown', 
            value: 1, 
            color: '#0088cc' 
          }))} 
        />
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 border-0 shadow-lg bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Recent Additions</h3>
            <p className="text-sm text-muted-foreground">Latest diamonds in your collection</p>
          </div>
          <ArrowRight className="h-5 w-5 text-primary cursor-pointer hover:translate-x-1 transition-transform" onClick={() => handleNavigate('/inventory')} />
        </div>
        <RecentDiamondsSection 
          diamonds={validDiamonds.slice(0, 5).map(d => ({ 
            ...d, 
            stock: d.id,
            name: d.shape || 'Diamond',
            price: d.price || 0
          }))} 
          isLoading={loading}
        />
      </Card>
    </EnhancedDashboardContent>
  );
}