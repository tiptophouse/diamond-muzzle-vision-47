import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { RealTimeUserCount } from '@/components/dashboard/RealTimeUserCount';
import { ElegantMemberCount } from '@/components/dashboard/ElegantMemberCount';
import { NotificationHeatMapSection } from '@/components/dashboard/NotificationHeatMapSection';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useEffect, useMemo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useNavigate } from 'react-router-dom';
import { Gem, Users, TrendingUp, Star, Plus, Upload, Bell } from 'lucide-react';
import { useFastApiNotifications } from '@/hooks/useFastApiNotifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { safeDivide, safeSum, safeRound, validateDiamondData } from '@/utils/safeMath';
import { useDiamondDistribution } from '@/hooks/useDiamondDistribution';
import { ColorDistributionChart } from '@/components/charts/ColorDistributionChart';
import { ClarityDistributionChart } from '@/components/charts/ClarityDistributionChart';
import { RecentDiamondsSection } from '@/components/charts/RecentDiamondsSection';

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
  
  const { data: distributionData, loading: distributionLoading, refetch: refetchDistribution } = useDiamondDistribution();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Safe data processing
  const { validDiamonds, processedData } = useMemo(() => {
    try {
      const diamondsArray = Array.isArray(allDiamonds) ? allDiamonds : [];
      const valid = diamondsArray.filter(diamond => {
        try {
          return validateDiamondData(diamond);
        } catch (error) {
          return false;
        }
      });
      
      let processed = { 
        stats: { totalDiamonds: 0, matchedPairs: 0, totalLeads: 0, activeSubscriptions: 0 }, 
        inventoryByShape: [], 
        salesByCategory: [] 
      };

      if (valid.length > 0 && user?.id) {
        try {
          processed = processDiamondDataForDashboard(
            valid.map(d => ({
              id: parseInt(String(d.id || '0')) || 0,
              shape: String(d.shape || 'Round'),
              color: String(d.color || 'D'),
              clarity: String(d.clarity || 'FL'),
              weight: Number(d.carat) || 0,
              price_per_carat: safeDivide(Number(d.price) || 0, Number(d.carat) || 1),
              owners: [user.id],
            })),
            user.id
          );
        } catch (error) {
          console.error('Data processing failed:', error);
        }
      }

      return { validDiamonds: valid, processedData: processed };
    } catch (error) {
      console.error('Complete data processing failed:', error);
      return { 
        validDiamonds: [], 
        processedData: { 
          stats: { totalDiamonds: 0, matchedPairs: 0, totalLeads: 0, activeSubscriptions: 0 }, 
          inventoryByShape: [], 
          salesByCategory: [] 
        } 
      };
    }
  }, [allDiamonds, user?.id]);

  const { stats, inventoryByShape, salesByCategory } = processedData;

  // Calculate metrics
  const { totalValue, availableDiamonds, avgPricePerCarat } = useMemo(() => {
    try {
      const calculatedTotalValue = safeSum(validDiamonds
        .map(d => Number(d?.price) || 0)
        .filter(price => price > 0 && price < 500000));
      
      const calculatedAvailable = validDiamonds.filter(d => 
        String(d?.status || '').toLowerCase() === 'available'
      ).length;
      
      let calculatedAvgPrice = 0;
      const validDiamondsForAvg = validDiamonds.filter(d => {
        const price = Number(d?.price) || 0;
        const carat = Number(d?.carat) || 0;
        return price > 0 && price < 500000 && carat > 0 && carat < 20;
      });
      
      if (validDiamondsForAvg.length > 0) {
        const totalValue = safeSum(validDiamondsForAvg.map(d => Number(d?.price) || 0));
        const totalCarats = safeSum(validDiamondsForAvg.map(d => Number(d?.carat) || 0));
        calculatedAvgPrice = safeRound(safeDivide(totalValue, totalCarats));
      }

      return {
        totalValue: calculatedTotalValue,
        availableDiamonds: calculatedAvailable,
        avgPricePerCarat: calculatedAvgPrice
      };
    } catch (error) {
      return { totalValue: 0, availableDiamonds: 0, avgPricePerCarat: 0 };
    }
  }, [validDiamonds]);

  const handleNavigate = (path: string) => {
    try {
      selectionChanged();
      navigate(path);
    } catch (error) {
      window.location.href = path;
    }
  };

  const handleButtonClick = (path: string) => {
    try {
      impactOccurred('medium');
      navigate(path);
    } catch (error) {
      window.location.href = path;
    }
  };

  // Show empty state when no valid diamonds
  if (!loading && validDiamonds.length === 0) {
    return (
      <div className="min-h-screen bg-background telegram-safe-area">
        <div className="telegram-header">
          <div className="flex items-center justify-between px-3 md:px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Diamond Inventory</h1>
              <p className="text-xs text-muted-foreground">Welcome to your dashboard</p>
            </div>
            <div className="w-8 h-8 bg-[var(--tg-theme-button-color)]/10 rounded-full flex items-center justify-center">
              <Gem className="h-4 w-4 text-[var(--tg-theme-button-color)]" />
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-16 h-16 bg-[var(--tg-theme-button-color)] rounded-2xl flex items-center justify-center shadow-lg">
            <Gem className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Start Your Collection</h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Upload your diamond inventory or add individual stones to get started
            </p>
          </div>
          
          <div className="space-y-3 w-full max-w-xs">
            <Button 
              onClick={() => handleButtonClick('/upload')} 
              className="w-full bg-[var(--tg-theme-button-color)] hover:bg-[var(--tg-theme-button-color)]/90 h-12 rounded-xl font-medium touch-target"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV File
            </Button>
            
            <Button 
              onClick={() => handleButtonClick('/upload')} 
              variant="outline"
              className="w-full h-12 rounded-xl font-medium border-border/60 touch-target"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Single Diamond
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 telegram-safe-area">
      {/* Mobile Header with Gradient */}
      <div className="telegram-header">
        <div className="bg-gradient-to-r from-[var(--tg-theme-button-color)]/5 to-[var(--tg-theme-button-color)]/10 backdrop-blur-sm border-b border-border/40 px-3 md:px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">Portfolio</h1>
              <p className="text-xs text-muted-foreground">
                {validDiamonds.length} diamonds • ${safeRound(safeDivide(totalValue, 1000))}K
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ElegantMemberCount />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 md:p-4 space-y-4 md:space-y-6">
        {/* Primary Stats - Mobile Optimized 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            title="Inventory"
            value={validDiamonds.length}
            icon={Gem}
            loading={loading}
            description="Total stones"
            trend={12}
            className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/30 touch-target"
          />
          <StatCard
            title="Value"
            value={safeRound(safeDivide(totalValue, 1000))}
            prefix="$"
            suffix="K"
            icon={Star}
            loading={loading}
            description="Portfolio"
            trend={8}
            className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/30 touch-target"
          />
          <StatCard
            title="Available"
            value={availableDiamonds}
            icon={Users}
            loading={loading}
            description="Ready to sell"
            trend={5}
            className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/30 touch-target"
          />
          <StatCard
            title="Price/Ct"
            value={avgPricePerCarat}
            prefix="$"
            icon={TrendingUp}
            loading={loading}
            description="Average"
            trend={-2}
            className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 border-orange-200/30 touch-target"
          />
        </div>

        <RealTimeUserCount />
        <NotificationHeatMapSection />
        
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
          <div className="p-3 md:p-4 bg-gradient-to-r from-muted/30 to-muted/10">
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
            <p className="text-xs text-muted-foreground">Manage your inventory</p>
          </div>
          <div className="divide-y divide-border/30">
            <button 
              onClick={() => handleNavigate('/inventory')}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-200 active:scale-[0.98] touch-target"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--tg-theme-button-color)]/10 rounded-xl flex items-center justify-center">
                  <Gem className="h-5 w-5 text-[var(--tg-theme-button-color)]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">View Inventory</p>
                  <p className="text-xs text-muted-foreground">Manage all diamonds</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {validDiamonds.length}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}