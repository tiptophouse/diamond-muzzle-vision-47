import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDiamondDistribution } from "@/hooks/useDiamondDistribution";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { ColorDistributionChart } from "@/components/charts/ColorDistributionChart";
import { ClarityDistributionChart } from "@/components/charts/ClarityDistributionChart";
import { RecentDiamondsSection } from "@/components/charts/RecentDiamondsSection";
import { 
  Diamond, 
  TrendingUp, 
  RefreshCw, 
  Upload, 
  Package, 
  Store, 
  BarChart3, 
  Zap,
  AlertCircle 
} from 'lucide-react';

export function MobileTelegramDashboard() {
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const { 
    data: { colorDistribution, clarityDistribution, recentDiamonds, totalDiamonds }, 
    loading: isLoading, 
    error, 
    refetch 
  } = useDiamondDistribution();
  
  const totalInventoryValue = colorDistribution.reduce((sum, item) => sum + item.totalValue, 0);
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();

  const handleQuickAction = (action: string, path: string) => {
    impactOccurred('light');
    selectionChanged();
    navigate(path);
  };

  const handleRefresh = async () => {
    impactOccurred('medium');
    await refetch();
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Mobile-first header with gradient background */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-muted/20 px-4 pt-4 pb-6 rounded-b-3xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, <span className="font-medium">{user?.first_name}</span>
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="shrink-0 h-9 px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''} ${isLoading ? '' : 'mr-2'}`} />
            {!isLoading && <span className="hidden sm:inline">Refresh</span>}
          </Button>
        </div>
        
        {/* Key Stats Cards - Mobile optimized */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-background/60 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Diamond className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Diamonds</p>
                  <p className="text-lg font-bold text-foreground">
                    {isLoading ? '...' : totalDiamonds.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/60 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Portfolio Value</p>
                  <p className="text-lg font-bold text-foreground">
                    {isLoading ? '...' : `$${(totalInventoryValue / 1000).toFixed(0)}K`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="px-4 space-y-6">
        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Error Loading Dashboard</h3>
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

        {/* Quick Actions Grid - Mobile optimized */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
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
                className="h-16 flex flex-col gap-1 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60"
              >
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Upload</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('inventory', '/inventory')} 
                className="h-16 flex flex-col gap-1 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60"
              >
                <Package className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Inventory</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('store', '/store')} 
                className="h-16 flex flex-col gap-1 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60"
              >
                <Store className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Store</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('insights', '/insights')} 
                className="h-16 flex flex-col gap-1 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 bg-background/60"
              >
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Insights</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}