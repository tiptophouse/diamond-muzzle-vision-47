import React, { useMemo, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { RealTimeUserCount } from '@/components/dashboard/RealTimeUserCount';
import { ElegantMemberCount } from '@/components/dashboard/ElegantMemberCount';
import { NotificationHeatMapSection } from '@/components/dashboard/NotificationHeatMapSection';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useNavigate } from 'react-router-dom';
import { Gem, Users, TrendingUp, Star, Plus, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SafeDataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

// Safe wrapper for any component that might crash
const SafeComponent: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode; name?: string }> = ({ 
  children, 
  fallback = null, 
  name = 'Component' 
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`❌ DASHBOARD: ${name} crashed:`, error);
    return <>{fallback}</>;
  }
};

export function SafeDataDrivenDashboard({ allDiamonds, loading, fetchData }: SafeDataDrivenDashboardProps) {
  const { user } = useTelegramAuth();
  const [renderError, setRenderError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('🔍 SafeDataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds?.length || 0);

  // Safe hooks with error handling
  const inventorySync = useMemo(() => {
    try {
      return useInventoryDataSync();
    } catch (error) {
      console.error('❌ DASHBOARD: useInventoryDataSync failed:', error);
      return { subscribeToInventoryChanges: () => () => {} };
    }
  }, []);

  const webAppData = useMemo(() => {
    try {
      return useEnhancedTelegramWebApp();
    } catch (error) {
      console.error('❌ DASHBOARD: useEnhancedTelegramWebApp failed:', error);
      return { webApp: null, haptics: null };
    }
  }, []);

  const hapticFeedback = useMemo(() => {
    try {
      return useTelegramHapticFeedback();
    } catch (error) {
      console.error('❌ DASHBOARD: useTelegramHapticFeedback failed:', error);
      return { selectionChanged: () => {}, impactOccurred: () => {} };
    }
  }, []);

  // Safe data processing with comprehensive error handling
  const safeDataProcessing = useMemo(() => {
    try {
      if (!allDiamonds || !Array.isArray(allDiamonds)) {
        console.warn('⚠️ DASHBOARD: Invalid diamonds data');
        return {
          totalValue: 0,
          availableDiamonds: 0,
          avgPricePerCarat: 0,
          inventoryByShape: []
        };
      }

      // Calculate total value with safety checks
      const totalValue = allDiamonds.reduce((sum, diamond) => {
        try {
          const price = Number(diamond?.price) || 0;
          if (price > 0 && price < 1000000 && isFinite(price)) {
            return sum + price;
          }
          return sum;
        } catch {
          return sum;
        }
      }, 0);

      // Calculate available diamonds safely
      const availableDiamonds = allDiamonds.filter(d => {
        try {
          return d?.status === 'Available';
        } catch {
          return false;
        }
      }).length;

      // Calculate average price per carat with division by zero protection
      const validDiamonds = allDiamonds.filter(d => {
        try {
          const price = Number(d?.price) || 0;
          const carat = Number(d?.carat) || 0;
          return price > 0 && price < 1000000 && carat > 0 && carat < 50 && isFinite(price) && isFinite(carat);
        } catch {
          return false;
        }
      });

      let avgPricePerCarat = 0;
      if (validDiamonds.length > 0) {
        try {
          const totalValue = validDiamonds.reduce((sum, d) => sum + (Number(d.price) || 0), 0);
          const totalCarats = validDiamonds.reduce((sum, d) => sum + (Number(d.carat) || 0), 0);
          
          if (totalCarats > 0) {
            avgPricePerCarat = Math.round(totalValue / totalCarats);
            if (!isFinite(avgPricePerCarat)) {
              avgPricePerCarat = 0;
            }
          }
        } catch (error) {
          console.error('❌ DASHBOARD: Error calculating avg price per carat:', error);
          avgPricePerCarat = 0;
        }
      }

      // Create inventory by shape data safely
      const shapeMap = new Map<string, number>();
      allDiamonds.forEach(diamond => {
        try {
          const shape = diamond?.shape || 'Unknown';
          shapeMap.set(shape, (shapeMap.get(shape) || 0) + 1);
        } catch {
          // Ignore invalid diamonds
        }
      });

      const inventoryByShape = Array.from(shapeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

      return {
        totalValue: isFinite(totalValue) ? totalValue : 0,
        availableDiamonds: isFinite(availableDiamonds) ? availableDiamonds : 0,
        avgPricePerCarat: isFinite(avgPricePerCarat) ? avgPricePerCarat : 0,
        inventoryByShape
      };
    } catch (error) {
      console.error('❌ DASHBOARD: Data processing failed:', error);
      setRenderError(`Data processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        totalValue: 0,
        availableDiamonds: 0,
        avgPricePerCarat: 0,
        inventoryByShape: []
      };
    }
  }, [allDiamonds]);

  // Safe navigation handlers
  const handleNavigate = (path: string) => {
    try {
      hapticFeedback.selectionChanged();
      navigate(path);
    } catch (error) {
      console.error('❌ DASHBOARD: Navigation failed:', error);
      toast.error('Navigation failed, please try again');
    }
  };

  const handleButtonClick = (path: string) => {
    try {
      hapticFeedback.impactOccurred('medium');
      navigate(path);
    } catch (error) {
      console.error('❌ DASHBOARD: Button click failed:', error);
      toast.error('Action failed, please try again');
    }
  };

  // Safe Telegram WebApp theme setup
  useEffect(() => {
    try {
      if (webAppData?.webApp) {
        const webApp = webAppData.webApp;
        if (webApp.backgroundColor) {
          document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor);
        }
        if (webApp.themeParams?.text_color) {
          document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color);
        }
        if (webApp.themeParams?.button_color) {
          document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color);
        }
      }
    } catch (error) {
      console.error('❌ DASHBOARD: Theme setup failed:', error);
    }
  }, [webAppData]);

  // Safe inventory changes subscription
  useEffect(() => {
    try {
      const unsubscribe = inventorySync.subscribeToInventoryChanges(() => {
        console.log('🔄 Dashboard: Inventory changed detected, refreshing dashboard data...');
        try {
          fetchData();
        } catch (error) {
          console.error('❌ DASHBOARD: fetchData failed:', error);
          toast.error('Failed to refresh data');
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('❌ DASHBOARD: Inventory sync setup failed:', error);
      return () => {};
    }
  }, [inventorySync, fetchData]);

  // Show error state if we have a render error
  if (renderError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Dashboard Error</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The dashboard encountered an error but your data is safe.
          </p>
          <Button 
            onClick={() => {
              setRenderError(null);
              handleNavigate('/inventory');
            }}
            className="w-full"
          >
            Go to Inventory Instead
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state when no diamonds
  if (!loading && (!allDiamonds || allDiamonds.length === 0)) {
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

  const { totalValue, availableDiamonds, avgPricePerCarat, inventoryByShape } = safeDataProcessing;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header with Gradient */}
      <div className="sticky top-0 bg-gradient-to-r from-[#0088cc]/5 to-[#0088cc]/10 backdrop-blur-sm border-b border-border/40 px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Portfolio</h1>
            <p className="text-xs text-muted-foreground">
              {allDiamonds?.length || 0} diamonds • ${Math.round((totalValue || 0) / 1000)}K
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SafeComponent name="ElegantMemberCount" fallback={<div className="w-8 h-6 bg-muted/30 rounded animate-pulse" />}>
              <ElegantMemberCount />
            </SafeComponent>
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
          <SafeComponent name="StatCard-Inventory" fallback={<div className="h-20 bg-muted/30 rounded-xl animate-pulse" />}>
            <StatCard
              title="Inventory"
              value={allDiamonds?.length || 0}
              icon={Gem}
              loading={loading}
              description="Total stones"
              trend={12}
              className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/30"
            />
          </SafeComponent>
          
          <SafeComponent name="StatCard-Value" fallback={<div className="h-20 bg-muted/30 rounded-xl animate-pulse" />}>
            <StatCard
              title="Value"
              value={Math.round((totalValue || 0) / 1000)}
              prefix="$"
              suffix="K"
              icon={Star}
              loading={loading}
              description="Portfolio"
              trend={8}
              className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/30"
            />
          </SafeComponent>
          
          <SafeComponent name="StatCard-Available" fallback={<div className="h-20 bg-muted/30 rounded-xl animate-pulse" />}>
            <StatCard
              title="Available"
              value={availableDiamonds || 0}
              icon={Users}
              loading={loading}
              description="Ready to sell"
              trend={5}
              className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/30"
            />
          </SafeComponent>
          
          <SafeComponent name="StatCard-PriceCt" fallback={<div className="h-20 bg-muted/30 rounded-xl animate-pulse" />}>
            <StatCard
              title="Price/Ct"
              value={avgPricePerCarat || 0}
              prefix="$"
              icon={TrendingUp}
              loading={loading}
              description="Average"
              trend={-2}
              className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 border-orange-200/30"
            />
          </SafeComponent>
        </div>

        {/* Real-time User Count */}
        <SafeComponent name="RealTimeUserCount" fallback={<div className="h-16 bg-muted/30 rounded-xl animate-pulse" />}>
          <RealTimeUserCount />
        </SafeComponent>

        {/* Notification Heat Map */}
        <SafeComponent name="NotificationHeatMapSection" fallback={<div className="h-32 bg-muted/30 rounded-xl animate-pulse" />}>
          <NotificationHeatMapSection />
        </SafeComponent>

        {/* Charts Section */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10">
            <h3 className="text-sm font-semibold text-foreground">Inventory Overview</h3>
            <p className="text-xs text-muted-foreground">Shape distribution</p>
          </div>
          <div className="p-4">
            <SafeComponent name="InventoryChart" fallback={<div className="h-48 bg-muted/30 rounded-xl animate-pulse" />}>
              <InventoryChart
                data={inventoryByShape.length > 0 ? inventoryByShape : []}
                title=""
                loading={loading}
              />
            </SafeComponent>
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