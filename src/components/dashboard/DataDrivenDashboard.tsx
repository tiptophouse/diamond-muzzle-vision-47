
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RealTimeUserCount } from '@/components/dashboard/RealTimeUserCount';
import { WelcomeBanner } from '@/components/tutorial/WelcomeBanner';
import { Layout } from '@/components/layout/Layout';
import { Gem, Users, TrendingUp, Star, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useNavigate } from 'react-router-dom';

interface DataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function DataDrivenDashboard({ allDiamonds, loading, fetchData }: DataDrivenDashboardProps) {
  const { user } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const navigate = useNavigate();
  
  // Simple admin check
  const isAdmin = user?.id === 2138564172 || user?.username === 'admin';

  console.log('🔍 DataDrivenDashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds.length);

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

  // Calculate actual metrics from real data
  const totalValue = allDiamonds.reduce((sum, diamond) => sum + diamond.price, 0);
  const availableDiamonds = allDiamonds.filter(d => d.status === 'Available').length;
  const storeVisibleDiamonds = allDiamonds.filter(d => d.store_visible).length;
  const avgPricePerCarat = allDiamonds.length > 0 
    ? Math.round(totalValue / allDiamonds.reduce((sum, d) => sum + d.carat, 0))
    : 0;

  // Show empty state when no diamonds
  if (!loading && allDiamonds.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <DashboardHeader emergencyMode={false} />
          
          <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-16 h-16 bg-[#0088cc] rounded-full flex items-center justify-center">
              <Gem className="h-8 w-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Welcome to Diamond Inventory</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Get started by uploading your diamond inventory or adding individual stones
              </p>
            </div>
            
            <div className="space-y-3 w-full max-w-xs">
              <Button 
                onClick={() => navigate('/upload')} 
                className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90"
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV File
              </Button>
              
              <Button 
                onClick={() => navigate('/upload')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Single Diamond
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <DashboardHeader emergencyMode={false} />
        
        {/* Primary Stats - 2x2 Grid for Mobile */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Inventory"
              value={allDiamonds.length}
              icon={Gem}
              loading={loading}
              description="Total stones"
              trend={12}
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
            />
            <StatCard
              title="Available"
              value={availableDiamonds}
              icon={Users}
              loading={loading}
              description="Ready to sell"
              trend={5}
            />
            <StatCard
              title="Price/Ct"
              value={Math.round(avgPricePerCarat / 100) * 100}
              prefix="$"
              icon={TrendingUp}
              loading={loading}
              description="Average"
              trend={-2}
            />
          </div>

          {/* Real-time User Count - Admin Only */}
          {isAdmin && <RealTimeUserCount />}

          {/* Charts Section */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">Inventory Overview</h3>
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
          </div>

          {/* Quick Actions - Telegram List Style */}
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
            </div>
            <div className="divide-y divide-border">
              <button 
                onClick={() => navigate('/inventory')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0088cc]/10 rounded-full flex items-center justify-center">
                    <Gem className="h-4 w-4 text-[#0088cc]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">View Inventory</p>
                    <p className="text-xs text-muted-foreground">Manage all diamonds</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">→</div>
              </button>
              
              <button 
                onClick={() => navigate('/upload')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0088cc]/10 rounded-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-[#0088cc]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Upload Data</p>
                    <p className="text-xs text-muted-foreground">Add new diamonds</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">→</div>
              </button>
              
              <button 
                onClick={() => navigate('/store')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0088cc]/10 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-[#0088cc]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Store View</p>
                    <p className="text-xs text-muted-foreground">Public catalog</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">→</div>
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="bg-[#0088cc]/5 border border-[#0088cc]/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-[#0088cc]">
              <div className="w-1.5 h-1.5 bg-[#0088cc] rounded-full animate-pulse"></div>
              <span className="font-medium">
                Live data • {allDiamonds.length} diamonds • Updated now
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
