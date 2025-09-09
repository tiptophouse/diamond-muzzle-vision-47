
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

      // Process data with error boundary
      let processed = { 
        stats: { 
          totalDiamonds: 0, 
          matchedPairs: 0, 
          totalLeads: 0, 
          activeSubscriptions: 0 
        }, 
        inventoryByShape: [], 
        salesByCategory: [] 
      };

      if (valid.length > 0 && user?.id) {
        try {
          processed = processDiamondDataForDashboard(
            valid.map(d => {
              try {
                return {
                  id: parseInt(String(d.id || '0')) || 0,
                  shape: String(d.shape || 'Round'),
                  color: String(d.color || 'D'),
                  clarity: String(d.clarity || 'FL'),
                  weight: Number(d.carat) || 0,
                  price_per_carat: safeDivide(Number(d.price) || 0, Number(d.carat) || 1),
                  owners: [user.id],
                };
              } catch (error) {
                console.error('❌ Dashboard: Failed to map diamond:', d, error);
                return {
                  id: 0,
                  shape: 'Round',
                  color: 'D', 
                  clarity: 'FL',
                  weight: 0,
                  price_per_carat: 0,
                  owners: [user.id],
                };
              }
            }),
            user.id
          );
        } catch (error) {
          console.error('❌ Dashboard: Data processing failed:', error);
          // Keep default processed data
        }
      }

      return { validDiamonds: valid, processedData: processed };
    } catch (error) {
      console.error('❌ Dashboard: Complete data processing failed:', error);
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

  // Calculate metrics with bulletproof error handling
  const { totalValue, availableDiamonds, avgPricePerCarat } = useMemo(() => {
    try {
      // Calculate total value safely
      let calculatedTotalValue = 0;
      try {
        const validPrices = validDiamonds
          .map(d => {
            const price = Number(d?.price) || 0;
            return (isFinite(price) && price > 0 && price < 500000) ? price : 0;
          })
          .filter(price => price > 0);
        
        calculatedTotalValue = safeSum(validPrices);
        console.log('💰 Total value calculated:', calculatedTotalValue, 'from', validPrices.length, 'valid diamonds');
      } catch (error) {
        console.error('❌ Dashboard: Total value calculation failed:', error);
        calculatedTotalValue = 0;
      }

      // Calculate available diamonds safely
      let calculatedAvailable = 0;
      try {
        calculatedAvailable = validDiamonds.filter(d => {
          try {
            return String(d?.status || '').toLowerCase() === 'available';
          } catch {
            return false;
          }
        }).length;
      } catch (error) {
        console.error('❌ Dashboard: Available diamonds calculation failed:', error);
        calculatedAvailable = 0;
      }

      // Calculate average price per carat safely
      let calculatedAvgPrice = 0;
      try {
        const validDiamondsForAvg = validDiamonds.filter(d => {
          try {
            const price = Number(d?.price) || 0;
            const carat = Number(d?.carat) || 0;
            return (
              isFinite(price) && price > 0 && price < 500000 && 
              isFinite(carat) && carat > 0 && carat < 20
            );
          } catch {
            return false;
          }
        });
        
        if (validDiamondsForAvg.length > 0) {
          const totalValue = safeSum(validDiamondsForAvg.map(d => Number(d?.price) || 0));
          const totalCarats = safeSum(validDiamondsForAvg.map(d => Number(d?.carat) || 0));
          
          calculatedAvgPrice = safeRound(safeDivide(totalValue, totalCarats));
          console.log('💎 Avg price per carat calculated:', calculatedAvgPrice, 'from', validDiamondsForAvg.length, 'valid diamonds');
        }
      } catch (error) {
        console.error('❌ Dashboard: Average price calculation failed:', error);
        calculatedAvgPrice = 0;
      }

      return {
        totalValue: calculatedTotalValue,
        availableDiamonds: calculatedAvailable,
        avgPricePerCarat: calculatedAvgPrice
      };
    } catch (error) {
      console.error('❌ Dashboard: All metrics calculations failed:', error);
      return { totalValue: 0, availableDiamonds: 0, avgPricePerCarat: 0 };
    }
  }, [validDiamonds]);

  const handleNavigate = (path: string) => {
    try {
      selectionChanged();
      navigate(path);
    } catch (error) {
      console.error('❌ Dashboard: Navigation failed:', error);
      // Fallback navigation
      window.location.href = path;
    }
  };

  const handleButtonClick = (path: string) => {
    try {
      impactOccurred('medium');
      navigate(path);
    } catch (error) {
      console.error('❌ Dashboard: Button click navigation failed:', error);
      // Fallback navigation
      window.location.href = path;
    }
  };

  // Show empty state when no valid diamonds
  if (!loading && validDiamonds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Diamond Inventory</h1>
              <p className="text-xs text-muted-foreground">Welcome to your dashboard</p>
            </div>
            <div className="w-8 h-8 bg-[#0088cc]/10 rounded-full flex items-center justify-center">
              <Gem className="h-4 w-4 text-[#0088cc]" />
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-16 h-16 bg-[#0088cc] rounded-2xl flex items-center justify-center shadow-lg">
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
              className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90 h-12 rounded-xl font-medium"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV File
            </Button>
            
            <Button 
              onClick={() => handleButtonClick('/upload')} 
              variant="outline"
              className="w-full h-12 rounded-xl font-medium border-border/60"
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
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header with Gradient */}
      <div className="sticky top-0 bg-gradient-to-r from-[#0088cc]/5 to-[#0088cc]/10 backdrop-blur-sm border-b border-border/40 px-4 py-4 z-10">
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
      
      <div className="p-4 space-y-6">
        {/* Primary Stats - 2x2 Mobile Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Inventory"
            value={validDiamonds.length}
            icon={Gem}
            loading={loading}
            description="Total stones"
            trend={12}
            className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/30"
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
            className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/30"
          />
          <StatCard
            title="Available"
            value={availableDiamonds}
            icon={Users}
            loading={loading}
            description="Ready to sell"
            trend={5}
            className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/30"
          />
          <StatCard
            title="Price/Ct"
            value={avgPricePerCarat}
            prefix="$"
            icon={TrendingUp}
            loading={loading}
            description="Average"
            trend={-2}
            className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 border-orange-200/30"
          />
        </div>

        {/* Real-time User Count */}
        <RealTimeUserCount />

        {/* Notification Heat Map */}
        <NotificationHeatMapSection />

        {/* Distribution Charts Section */}
        <div className="grid gap-4">
          {/* Color and Clarity Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <ColorDistributionChart 
              distribution={distributionData.colorDistribution} 
              isLoading={distributionLoading}
            />
            <ClarityDistributionChart 
              distribution={distributionData.clarityDistribution} 
              isLoading={distributionLoading}
            />
          </div>
          
          {/* Recent Diamonds */}
          <RecentDiamondsSection 
            diamonds={distributionData.recentDiamonds.map(d => ({ ...d, stock: d.certificate_number?.toString() || d.id }))} 
            isLoading={distributionLoading}
          />
        </div>

        {/* Shape Distribution Chart */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10">
            <h3 className="text-sm font-semibold text-foreground">Inventory Overview</h3>
            <p className="text-xs text-muted-foreground">Shape distribution</p>
          </div>
          <div className="p-4">
            <InventoryChart
              data={inventoryByShape.length > 0 ? inventoryByShape : [
                { name: 'Round', value: validDiamonds.filter(d => d.shape === 'Round').length },
                { name: 'Princess', value: validDiamonds.filter(d => d.shape === 'Princess').length },
                { name: 'Emerald', value: validDiamonds.filter(d => d.shape === 'Emerald').length },
                { name: 'Oval', value: validDiamonds.filter(d => d.shape === 'Oval').length },
                { name: 'Other', value: validDiamonds.filter(d => !['Round', 'Princess', 'Emerald', 'Oval'].includes(d.shape)).length }
              ].filter(item => item.value > 0)}
              title=""
              loading={loading}
            />
          </div>
        </div>

        {/* Quick Actions - Telegram Style */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10">
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
            <p className="text-xs text-muted-foreground">Manage your inventory</p>
          </div>
          <div className="divide-y divide-border/30">
            <button 
              onClick={() => handleNavigate('/inventory')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0088cc]/10 rounded-xl flex items-center justify-center">
                  <Gem className="h-5 w-5 text-[#0088cc]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">View Inventory</p>
                  <p className="text-xs text-muted-foreground">Manage all diamonds</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">→</div>
            </button>
            
            <button 
              onClick={() => handleNavigate('/upload')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Upload Data</p>
                  <p className="text-xs text-muted-foreground">Add new diamonds</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">→</div>
            </button>
            
            <button 
              onClick={() => handleNavigate('/store')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Store View</p>
                  <p className="text-xs text-muted-foreground">Public catalog</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">→</div>
            </button>
          </div>
        </div>

        {/* Status Footer */}
        <div className="bg-gradient-to-r from-[#0088cc]/5 to-[#0088cc]/10 border border-[#0088cc]/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#0088cc] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[#0088cc]">
                Real-time data
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: just now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
