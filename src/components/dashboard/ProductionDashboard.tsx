import React, { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useProductionTelegramApp } from '@/hooks/useProductionTelegramApp';
import { api } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Diamond, 
  Package, 
  TrendingUp, 
  DollarSign,
  Eye,
  Share2,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalDiamonds: number;
  totalValue: number;
  recentDiamonds: any[];
  loading: boolean;
}

export function ProductionDashboard() {
  const { user, isAuthenticated } = useTelegramAuth();
  const { haptic, mainButton, colorScheme, platform } = useProductionTelegramApp();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalDiamonds: 0,
    totalValue: 0,
    recentDiamonds: [],
    loading: true
  });
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user || !isAuthenticated) return;
    
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      const response = await api.get<any[]>(`/api/v1/get_all_stones?user_id=${user.id}`);
      
      if (response.error) throw new Error(response.error);
      
      const diamonds = response.data || [];
      const totalValue = diamonds.reduce((sum, diamond) => {
        const price = Number(diamond.price_per_carat || diamond.price || 0);
        const weight = Number(diamond.weight || diamond.carat || 0);
        return sum + (price * weight);
      }, 0);
      
      setStats({
        totalDiamonds: diamonds.length,
        totalValue,
        recentDiamonds: diamonds.slice(0, 3), // Show latest 3
        loading: false
      });
      
      // Show main button for quick actions
      mainButton.show('Add New Diamond', () => {
        haptic.impact('medium');
        window.location.href = '/upload-single-stone';
      }, {
        color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        textColor: colorScheme === 'dark' ? '#000000' : '#ffffff'
      });
      
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setStats(prev => ({ ...prev, loading: false }));
      
      toast({
        variant: "destructive",
        title: "Failed to load dashboard",
        description: "Please check your connection and try again"
      });
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
    
    // Cleanup main button on unmount
    return () => {
      mainButton.hide();
    };
  }, [isAuthenticated, user]);
  
  const handleDiamondClick = (diamond: any) => {
    haptic.selection();
    window.location.href = `/diamond/${diamond.stock_number || diamond.stockNumber}`;
  };
  
  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  if (stats.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your diamonds...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background to-muted/20",
      platform === 'ios' && "pb-safe"
    )}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.first_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your diamond inventory
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Inventory</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalDiamonds}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPrice(stats.totalValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-2 border-0 shadow-md bg-card/80"
            onClick={() => {
              haptic.impact('light');
              window.location.href = '/upload-single-stone';
            }}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add Diamond</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-2 border-0 shadow-md bg-card/80"
            onClick={() => {
              haptic.impact('light');
              window.location.href = '/store';
            }}
          >
            <Eye className="h-5 w-5" />
            <span className="text-xs">Browse Store</span>
          </Button>
        </div>
      </div>
      
      {/* Recent Diamonds */}
      {stats.recentDiamonds.length > 0 && (
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Additions</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                haptic.selection();
                window.location.href = '/inventory';
              }}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {stats.recentDiamonds.map((diamond, index) => (
              <Card 
                key={index}
                className="border-0 shadow-md bg-card/90 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-98"
                onClick={() => handleDiamondClick(diamond)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Diamond className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {diamond.shape} {diamond.weight}ct
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {diamond.color}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {diamond.clarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatPrice(Number(diamond.price_per_carat || diamond.price || 0) * Number(diamond.weight || diamond.carat || 0))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${Number(diamond.price_per_carat || diamond.price || 0).toLocaleString()}/ct
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {stats.totalDiamonds === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Diamond className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Start Building Your Inventory
          </h3>
          <p className="text-muted-foreground mb-6">
            Add your first diamond to begin tracking your portfolio
          </p>
          <Button 
            onClick={() => {
              haptic.impact('medium');
              window.location.href = '/upload-single-stone';
            }}
            className="w-full max-w-sm mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Diamond
          </Button>
        </div>
      )}
    </div>
  );
}