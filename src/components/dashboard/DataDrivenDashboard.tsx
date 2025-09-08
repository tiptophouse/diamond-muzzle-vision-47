
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
import { useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useNavigate } from 'react-router-dom';
import { Gem, Users, TrendingUp, Star, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds.length);

  // Set Telegram WebApp theme
  useEffect(() => {
    if (webApp) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams?.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams?.button_color || '#0088cc');
    }
  }, [webApp]);

  // Listen for inventory changes and refresh dashboard data immediately
  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 Dashboard: Inventory changed detected, refreshing dashboard data...');
      fetchData();
    });

    return unsubscribe;
  }, [subscribeToInventoryChanges, fetchData]);

  // Process the data only if we have diamonds
  const { stats, inventoryByShape, salesByCategory } = allDiamonds.length > 0 
    ? processDiamondDataForDashboard(
        allDiamonds.map(d => ({
          id: parseInt(d.id || '0'),
          shape: d.shape,
          color: d.color,
          clarity: d.clarity,
          weight: d.carat,
          price_per_carat: d.price / d.carat,
          owners: [user?.id || 0],
        })),
        user?.id
      )
    : { 
        stats: { 
          totalDiamonds: 0, 
          matchedPairs: 0, 
          totalLeads: 0, 
          activeSubscriptions: 0 
        }, 
        inventoryByShape: [], 
        salesByCategory: [] 
      };

  // Calculate actual metrics from real data with realistic bounds
  const calculateTotalValue = () => {
    const total = allDiamonds.reduce((sum, diamond) => {
      const price = diamond.price;
      if (price > 0 && price < 500000) {
        return sum + price;
      }
      return sum;
    }, 0);
    
    console.log('💰 Total value calculated:', total);
    return total;
  };

  const calculateAvgPricePerCarat = () => {
    const validDiamonds = allDiamonds.filter(d => 
      d.price > 0 && d.price < 500000 && d.carat > 0 && d.carat < 20
    );
    
    if (validDiamonds.length === 0) return 0;
    
    const totalValue = validDiamonds.reduce((sum, d) => sum + d.price, 0);
    const totalCarats = validDiamonds.reduce((sum, d) => sum + d.carat, 0);
    
    const avgPricePerCarat = Math.round(totalValue / totalCarats);
    console.log('💎 Avg price per carat calculated:', avgPricePerCarat, 'from', validDiamonds.length, 'valid diamonds');
    
    return avgPricePerCarat;
  };

  const totalValue = calculateTotalValue();
  const availableDiamonds = allDiamonds.filter(d => d.status === 'Available').length;
  const avgPricePerCarat = calculateAvgPricePerCarat();

  const handleNavigate = (path: string) => {
    selectionChanged();
    navigate(path);
  };

  const handleButtonClick = (path: string) => {
    impactOccurred('medium');
    navigate(path);
  };

  // Show empty state when no diamonds
  if (!loading && allDiamonds.length === 0) {
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
              {allDiamonds.length} diamonds • ${Math.round(totalValue / 1000)}K
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
            value={allDiamonds.length}
            icon={Gem}
            loading={loading}
            description="Total stones"
            trend={12}
            className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/30"
          />
          <StatCard
            title="Value"
            value={Math.round(totalValue / 1000)}
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

        {/* Charts Section */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10">
            <h3 className="text-sm font-semibold text-foreground">Inventory Overview</h3>
            <p className="text-xs text-muted-foreground">Shape distribution</p>
          </div>
          <div className="p-4">
            <InventoryChart
              data={inventoryByShape.length > 0 ? inventoryByShape : [
                { name: 'Round', value: allDiamonds.filter(d => d.shape === 'Round').length },
                { name: 'Princess', value: allDiamonds.filter(d => d.shape === 'Princess').length },
                { name: 'Emerald', value: allDiamonds.filter(d => d.shape === 'Emerald').length },
                { name: 'Oval', value: allDiamonds.filter(d => d.shape === 'Oval').length },
                { name: 'Other', value: allDiamonds.filter(d => !['Round', 'Princess', 'Emerald', 'Oval'].includes(d.shape)).length }
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
