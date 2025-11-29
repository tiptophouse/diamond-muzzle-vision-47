import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDiamondDistribution } from "@/hooks/useDiamondDistribution";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useSearchResults } from "@/hooks/useSearchResults";
import { ColorDistributionChart } from "@/components/charts/ColorDistributionChart";
import { ClarityDistributionChart } from "@/components/charts/ClarityDistributionChart";
import { RecentDiamondsSection } from "@/components/charts/RecentDiamondsSection";
import { DashboardCard, DashboardShimmer, DashboardErrorAlert } from "@/components/dashboard/DashboardAnimated";
import { useState, useEffect } from "react";
import { formatLargeNumber } from "@/utils/numberUtils";
import { 
  Diamond, 
  TrendingUp, 
  RefreshCw, 
  Upload, 
  Package, 
  Store, 
  BarChart3, 
  Zap,
  AlertCircle,
  Bell,
  Users,
  Search,
  Activity,
  Target,
  Sparkles,
  Star,
  ArrowRight
} from 'lucide-react';

interface StartupMetrics {
  totalUsers: number;
  activeToday: number;
  searchMatches: number;
  totalRevenue: number;
  growthRate: number;
}

export function StartupDashboard() {
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const { 
    data: { colorDistribution, clarityDistribution, recentDiamonds, totalDiamonds }, 
    loading: isLoading, 
    error, 
    refetch 
  } = useDiamondDistribution();
  
  const { searchResults, searchResultsCount, loading: searchLoading } = useSearchResults();
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();
  
  const [metrics, setMetrics] = useState<StartupMetrics>({
    totalUsers: 375,
    activeToday: 42,
    searchMatches: 28,
    totalRevenue: 15600,
    growthRate: 23.4
  });
  
  const totalInventoryValue = colorDistribution.reduce((sum, item) => sum + item.totalValue, 0);
  const unreadNotifications = searchResults.filter(r => r.result_type === 'match').length;

  const handleQuickAction = (action: string, path: string) => {
    impactOccurred('light');
    selectionChanged();
    navigate(path);
  };

  const handleRefresh = async () => {
    impactOccurred('medium');
    await refetch();
  };

  // Show loading shimmer while data loads
  if (isLoading && colorDistribution.length === 0) {
    return <DashboardShimmer />;
  }

  // Show error alert with retry option
  if (error && !isLoading) {
    return <DashboardErrorAlert message={error} onRetry={handleRefresh} />;
  }

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeToday: prev.activeToday + Math.floor(Math.random() * 3),
        searchMatches: prev.searchMatches + Math.floor(Math.random() * 2),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 500)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5 pb-6">
      {/* Startup-style header with notifications */}
      <div className="relative bg-gradient-to-br from-primary/8 via-primary/12 to-purple-500/8 px-4 pt-6 pb-8 rounded-b-3xl mb-6 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, <span className="font-semibold text-primary">{user?.first_name || 'Trader'}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notification Bell with count */}
              <div className="relative">
                <Button 
                  onClick={() => handleQuickAction('notifications', '/notifications')}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-background/60 backdrop-blur-sm border-primary/20"
                >
                  <Bell className="w-4 h-4" />
                </Button>
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-10 px-4 bg-background/60 backdrop-blur-sm border-primary/20"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''} ${isLoading ? '' : 'mr-2'}`} />
                {!isLoading && <span className="hidden sm:inline">Sync</span>}
              </Button>
            </div>
          </div>
          
          {/* Startup Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <DashboardCard>
              <Card className="bg-background/70 backdrop-blur-sm border-primary/20 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-primary/20">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total Users</p>
                      <p className="text-xl font-bold text-foreground">
                        {metrics.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 font-medium">+{metrics.growthRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DashboardCard>
            
            <DashboardCard>
              <Card className="bg-background/70 backdrop-blur-sm border-primary/20 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Active Today</p>
                      <p className="text-xl font-bold text-foreground">
                        {metrics.activeToday}
                      </p>
                      <p className="text-xs text-green-600 font-medium">Live</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DashboardCard>
            
            <DashboardCard>
              <Card className="bg-background/70 backdrop-blur-sm border-primary/20 cursor-pointer hover:bg-background/80 transition-colors h-full" onClick={() => handleQuickAction('matches', '/notifications')}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <Search className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Matches</p>
                      <p className="text-xl font-bold text-foreground">
                        {searchResultsCount?.total || metrics.searchMatches}
                      </p>
                      <p className="text-xs text-purple-600 font-medium">New</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DashboardCard>
            
            <DashboardCard>
              <Card className="bg-background/70 backdrop-blur-sm border-primary/20 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium">Revenue</p>
                      <p className="text-xl font-bold text-foreground truncate" title={`$${metrics.totalRevenue.toLocaleString()}`}>
                        ${formatLargeNumber(metrics.totalRevenue)}
                      </p>
                      <p className="text-xs text-orange-600 font-medium">Monthly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DashboardCard>
          </div>

          {/* Personal Inventory Stats */}
          <div className="grid grid-cols-2 gap-3">
            <DashboardCard>
              <Card className="bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-sm border-primary/30 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30">
                      <Diamond className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">My Diamonds</p>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoading ? '...' : totalDiamonds.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <p className="text-xs text-muted-foreground">Premium stock</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DashboardCard>
            
            <DashboardCard>
              <Card className="bg-gradient-to-br from-background/80 to-green-500/5 backdrop-blur-sm border-green-500/30 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/30">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium">Portfolio Value</p>
                      <p className="text-2xl font-bold text-foreground truncate" title={isLoading ? 'Loading...' : `$${totalInventoryValue.toLocaleString()}`}>
                        {isLoading ? '...' : `$${formatLargeNumber(totalInventoryValue)}`}
                      </p>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-green-600 font-medium">Growing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DashboardCard>
          </div>
        </div>
      </div>
      
      <div className="px-4 space-y-6">
        {/* Search Results Notification Section */}
        {!searchLoading && searchResults.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Customer Searches</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {searchResults.length} New
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleQuickAction('notifications', '/notifications')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {searchResults.slice(0, 3).map((result, index) => (
                  <div 
                    key={result.id} 
                    onClick={() => handleQuickAction('notifications', `/notifications?buyerId=${result.buyer_id}`)}
                    className="flex items-center justify-between p-3 bg-background/60 rounded-lg hover:bg-background/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${result.result_type === 'match' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                      <div>
                        <p className="text-sm font-medium">{result.search_query}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.result_type === 'match' ? '✅ Match found' : '🔍 Searching...'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={result.result_type === 'match' ? 'default' : 'secondary'}>
                      {result.result_type}
                    </Badge>
                  </div>
                ))}
                {searchResults.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    +{searchResults.length - 3} more searches
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Error Loading Data</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section - Mobile optimized */}
        <div className="space-y-4">
          <ColorDistributionChart 
            distribution={colorDistribution} 
            isLoading={isLoading}
          />
          <ClarityDistributionChart 
            distribution={clarityDistribution} 
            isLoading={isLoading}
          />
        </div>

        {/* Recent Diamonds */}
        <RecentDiamondsSection 
          diamonds={recentDiamonds.map(d => ({ ...d, stock: d.certificate_number?.toString() || d.id }))} 
          isLoading={isLoading} 
        />

        {/* Quick Actions Grid - Startup style */}
        <Card className="bg-gradient-to-r from-primary/8 to-purple-500/8 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('upload', '/upload')} 
                className="h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Upload</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('inventory', '/inventory')} 
                className="h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Inventory</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('store', '/store')} 
                className="h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Store</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('insights', '/insights')} 
                className="h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}