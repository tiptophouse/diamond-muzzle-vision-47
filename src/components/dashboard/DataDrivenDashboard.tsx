
import React, { useEffect, memo } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RealTimeUserCount } from '@/components/dashboard/RealTimeUserCount';
import { Gem, Users, TrendingUp, Star, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useNavigate } from 'react-router-dom';
import { useUnifiedTelegramWebApp } from '@/hooks/useUnifiedTelegramWebApp';
import { logger } from '@/utils/logger';

interface DataDrivenDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export const DataDrivenDashboard = memo(function DataDrivenDashboard({ 
  allDiamonds, 
  loading, 
  fetchData 
}: DataDrivenDashboardProps) {
  const { user } = useTelegramAuth();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const { haptics } = useUnifiedTelegramWebApp();
  const navigate = useNavigate();

  logger.log('🔍 Dashboard: Processing data for user:', user?.id, 'Diamonds:', allDiamonds.length);

  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      logger.log('🔄 Dashboard: Inventory changed detected, refreshing...');
      fetchData();
    });
    return unsubscribe;
  }, [subscribeToInventoryChanges, fetchData]);

  const { stats, inventoryByShape } = allDiamonds.length > 0 
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

  const calculateMetrics = () => {
    const validDiamonds = allDiamonds.filter(d => 
      d.price > 0 && d.price < 500000 && d.carat > 0 && d.carat < 20
    );
    
    const totalValue = validDiamonds.reduce((sum, d) => sum + d.price, 0);
    const totalCarats = validDiamonds.reduce((sum, d) => sum + d.carat, 0);
    
    return {
      totalValue,
      availableDiamonds: allDiamonds.filter(d => d.status === 'Available').length,
      avgPricePerCarat: totalCarats > 0 ? Math.round(totalValue / totalCarats) : 0
    };
  };

  const { totalValue, availableDiamonds, avgPricePerCarat } = calculateMetrics();

  const handleNavigation = (path: string) => {
    haptics.light();
    navigate(path);
  };

  if (!loading && allDiamonds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader emergencyMode={false} />
        
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Gem className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Welcome to Diamond Inventory</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Get started by uploading your diamond inventory or adding individual stones
            </p>
          </div>
          
          <div className="space-y-3 w-full max-w-xs">
            <Button 
              onClick={() => handleNavigation('/upload')} 
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV File
            </Button>
            
            <Button 
              onClick={() => handleNavigation('/upload-single-stone')} 
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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader emergencyMode={false} />
      
      <div className="p-4 space-y-4">
        {/* Stats Grid - Optimized for mobile */}
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
            value={avgPricePerCarat}
            prefix="$"
            icon={TrendingUp}
            loading={loading}
            description="Average"
            trend={-2}
          />
        </div>

        <RealTimeUserCount />

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

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
          </div>
          <div className="divide-y divide-border">
            {[
              { icon: Gem, title: 'View Inventory', desc: 'Manage all diamonds', path: '/inventory' },
              { icon: Upload, title: 'Upload Data', desc: 'Add new diamonds', path: '/upload' },
              { icon: Star, title: 'Store View', desc: 'Public catalog', path: '/store' }
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => handleNavigation(action.path)}
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors active:scale-[0.98] touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">→</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Status */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-primary">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="font-medium">
              Live • {allDiamonds.length} diamonds • ${Math.round(totalValue / 1000)}K value
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
