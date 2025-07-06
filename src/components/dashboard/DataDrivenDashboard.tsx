import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { processDiamondDataForDashboard } from '@/services/diamondAnalytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeBanner } from '@/components/tutorial/WelcomeBanner';
import { Layout } from '@/components/layout/Layout';
import { Gem, Users, TrendingUp, Star, Plus, Upload, Scissors, Weight, Eye, DollarSign } from 'lucide-react';
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

  // Enhanced analytics calculations
  const totalCarats = allDiamonds.reduce((sum, d) => sum + d.carat, 0);
  const avgCarat = allDiamonds.length > 0 ? (totalCarats / allDiamonds.length).toFixed(2) : 0;
  
  // Cut distribution
  const cutDistribution = allDiamonds.reduce((acc, diamond) => {
    const cut = diamond.cut || 'Unknown';
    acc[cut] = (acc[cut] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Carat ranges
  const caratRanges = {
    'Under 0.5ct': allDiamonds.filter(d => d.carat < 0.5).length,
    '0.5-1.0ct': allDiamonds.filter(d => d.carat >= 0.5 && d.carat < 1.0).length,
    '1.0-2.0ct': allDiamonds.filter(d => d.carat >= 1.0 && d.carat < 2.0).length,
    '2.0ct+': allDiamonds.filter(d => d.carat >= 2.0).length,
  };

  // Clarity distribution
  const clarityDistribution = allDiamonds.reduce((acc, diamond) => {
    const clarity = diamond.clarity || 'Unknown';
    acc[clarity] = (acc[clarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Price ranges
  const priceRanges = {
    'Under $1K': allDiamonds.filter(d => d.price < 1000).length,
    '$1K-$5K': allDiamonds.filter(d => d.price >= 1000 && d.price < 5000).length,
    '$5K-$10K': allDiamonds.filter(d => d.price >= 5000 && d.price < 10000).length,
    '$10K+': allDiamonds.filter(d => d.price >= 10000).length,
  };

  // Premium stones (high value)
  const premiumStones = allDiamonds.filter(d => 
    (d.color && ['D', 'E', 'F'].includes(d.color)) &&
    (d.clarity && ['FL', 'IF', 'VVS1', 'VVS2'].includes(d.clarity)) &&
    d.carat >= 1.0
  ).length;

  // Show empty state when no diamonds
  if (!loading && allDiamonds.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsla(var(--primary),0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsla(var(--accent),0.05)_0%,transparent_50%)]" />
          
          <div className="relative space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="animate-fade-in">
              <WelcomeBanner />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <DashboardHeader emergencyMode={false} />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-xl text-center py-16 hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsla(var(--primary),0.05)_0%,transparent_70%)]" />
                <CardHeader className="relative">
                  <div className="mx-auto mb-6 p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 w-20 h-20 flex items-center justify-center">
                    <Gem className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Welcome to Diamond Muzzle! ✨
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-4">
                    Your diamond inventory management system is ready to go
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-8">
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Get started by adding diamonds to your inventory using one of the methods below:
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => navigate('/upload')} 
                      className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group"
                      size="lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <Upload className="h-5 w-5 mr-2" />
                      Upload CSV File
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/upload')} 
                      variant="outline"
                      className="relative overflow-hidden border-2 border-border hover:border-primary/50 hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 group"
                      size="lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <Plus className="h-5 w-5 mr-2" />
                      Add Single Diamond
                    </Button>
                  </div>
                  
                  <div className="mt-12 text-sm text-muted-foreground space-y-2 max-w-lg mx-auto">
                    <p className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <strong>Tip:</strong> You can upload a CSV file with multiple diamonds or add them one by one
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      📊 Your dashboard will show analytics once you have inventory data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsla(var(--primary),0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsla(var(--accent),0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,hsla(var(--primary),0.03)_0%,transparent_50%)]" />
        
        <div className="relative space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="animate-fade-in">
            <WelcomeBanner />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <DashboardHeader emergencyMode={false} />
          </div>
          
          {/* Hero Stats Grid with Staggered Animation */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Diamonds",
                value: allDiamonds.length,
                icon: Gem,
                description: `$${totalValue.toLocaleString()} total value`,
                gradient: "from-primary/5 to-transparent"
              },
              {
                title: "Available",
                value: availableDiamonds,
                icon: Users,
                description: `${((availableDiamonds / allDiamonds.length) * 100).toFixed(1)}% of inventory`,
                gradient: "from-accent/5 to-transparent"
              },
              {
                title: "Store Visible",
                value: storeVisibleDiamonds,
                icon: TrendingUp,
                description: `${((storeVisibleDiamonds / allDiamonds.length) * 100).toFixed(1)}% visible`,
                gradient: "from-primary/5 to-transparent"
              },
              {
                title: "Avg Price/Ct",
                value: avgPricePerCarat,
                prefix: "$",
                icon: Star,
                description: "Per carat average",
                gradient: "from-accent/5 to-transparent"
              }
            ].map((stat, index) => (
              <div 
                key={stat.title}
                className="animate-fade-in hover-scale group" 
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:border-primary/30">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <StatCard
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    icon={stat.icon}
                    loading={loading}
                    description={stat.description}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Analytics Section */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              {
                title: "Total Carats",
                value: Number(totalCarats.toFixed(2)),
                suffix: "ct",
                icon: Weight,
                description: `${avgCarat}ct average weight`,
                gradient: "from-primary/5 to-transparent"
              },
              {
                title: "Premium Stones",
                value: premiumStones,
                icon: Star,
                description: "D-F color, VVS+ clarity, 1ct+",
                gradient: "from-accent/5 to-transparent"
              },
              {
                title: "Highest Price",
                value: Math.max(...allDiamonds.map(d => d.price), 0),
                prefix: "$",
                icon: DollarSign,
                description: "Most valuable stone",
                gradient: "from-primary/5 to-transparent"
              },
              {
                title: "Cut Excellence",
                value: allDiamonds.filter(d => d.cut === 'Excellent').length,
                icon: Scissors,
                description: `${((allDiamonds.filter(d => d.cut === 'Excellent').length / allDiamonds.length) * 100).toFixed(1)}% excellent cut`,
                gradient: "from-accent/5 to-transparent"
              }
            ].map((stat) => (
              <div key={stat.title} className="hover-scale group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:border-primary/30">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <StatCard
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    icon={stat.icon}
                    loading={loading}
                    description={stat.description}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Analytics Charts */}
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="hover-scale">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500">
                <InventoryChart
                  data={Object.entries(cutDistribution).map(([name, value]) => ({ name, value })).filter(item => item.value > 0)}
                  title="Cut Distribution"
                  loading={loading}
                />
              </div>
            </div>
            
            <div className="hover-scale">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500">
                <InventoryChart
                  data={Object.entries(caratRanges).map(([name, value]) => ({ name, value })).filter(item => item.value > 0)}
                  title="Carat Weight Ranges"
                  loading={loading}
                />
              </div>
            </div>
            
            <div className="hover-scale">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500">
                <InventoryChart
                  data={Object.entries(clarityDistribution).map(([name, value]) => ({ name, value })).filter(item => item.value > 0)}
                  title="Clarity Distribution"
                  loading={loading}
                />
              </div>
            </div>
          </div>

          {/* Price Analysis with Enhanced Design */}
          <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.8s' }}>
            <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  Price Analysis
                </CardTitle>
                <CardDescription>Inventory value distribution and insights</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      Price Ranges
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(priceRanges).map(([range, count]) => (
                        <div key={range} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                          <span className="text-sm font-medium">{range}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{count}</span>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" 
                                style={{ width: `${(count / allDiamonds.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      Value Insights
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-xl border border-green-200/50 dark:border-green-800/30">
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Total Portfolio Value</span>
                        <span className="font-bold text-green-900 dark:text-green-200">${totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Average Diamond Value</span>
                        <span className="font-bold text-blue-900 dark:text-blue-200">${Math.round(totalValue / allDiamonds.length).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Value per Carat</span>
                        <span className="font-bold text-purple-900 dark:text-purple-200">${avgPricePerCarat.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions with Enhanced Design */}
          <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your inventory efficiently</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "View All Inventory", icon: Gem, path: "/inventory", variant: "outline" as const },
                    { label: "Upload More Diamonds", icon: Upload, path: "/upload", variant: "outline" as const },
                    { label: "View Store", icon: Star, path: "/store", variant: "outline" as const }
                  ].map((action) => (
                    <Button 
                      key={action.label}
                      onClick={() => navigate(action.path)} 
                      variant={action.variant}
                      className="relative overflow-hidden border-2 border-border hover:border-primary/50 hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Source Info */}
          <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
            <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="font-medium">
                    Showing data from {allDiamonds.length > 5 ? 'your uploaded inventory' : 'sample diamonds'}
                    {allDiamonds.length <= 5 && ' - Upload your CSV file to see real data'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}