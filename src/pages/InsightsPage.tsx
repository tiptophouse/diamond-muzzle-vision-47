
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InsightsHeader } from "@/components/insights/InsightsHeader";
import { ShapeDistributionChart } from "@/components/insights/ShapeDistributionChart";
import { ShapeAnalysisCard } from "@/components/insights/ShapeAnalysisCard";
import { QuickStatsGrid } from "@/components/insights/QuickStatsGrid";
import { MarketDemandCard } from "@/components/insights/MarketDemandCard";
import { GroupInsightsCard } from "@/components/insights/GroupInsightsCard";
import { PersonalInsightsCard } from "@/components/insights/PersonalInsightsCard";
import { ProfitabilityInsights } from "@/components/insights/ProfitabilityInsights";
import { MarketComparison } from "@/components/insights/MarketComparison";
import { InventoryVelocity } from "@/components/insights/InventoryVelocity";
import { useInsightsData } from "@/hooks/useInsightsData";
import { useEnhancedInsights } from "@/hooks/useEnhancedInsights";
import { BarChart3, TrendingUp, Zap, Target, RefreshCw, Upload } from "lucide-react";

export default function InsightsPage() {
  const {
    loading: basicLoading,
    marketTrends,
    totalDiamonds,
    demandInsights,
    groupInsights,
    personalInsights,
    fetchRealInsights,
    isAuthenticated: basicAuth
  } = useInsightsData();

  const {
    isLoading: enhancedLoading,
    insights: enhancedData,
    refetch: refetchEnhanced,
    error: enhancedError
  } = useEnhancedInsights();
  
  if (!basicAuth) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please authenticate to view portfolio insights.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </TelegramLayout>
    );
  }
  
  const loading = basicLoading || enhancedLoading;
  
  if (loading) {
    return (
      <TelegramLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Intelligence</h1>
            <p className="text-muted-foreground">Analyzing your real diamond inventory data</p>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your real portfolio data...</p>
            </div>
          </div>
        </div>
      </TelegramLayout>
    );
  }

  const handleRefreshAll = async () => {
    await Promise.all([fetchRealInsights(), refetchEnhanced()]);
  };

  return (
    <TelegramLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Intelligence</h1>
            <p className="text-muted-foreground">Real insights from your actual diamond inventory</p>
          </div>
          <Button onClick={handleRefreshAll} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {totalDiamonds === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Diamond Data Available</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                To view your portfolio insights, you need to upload your diamond inventory first. 
                All insights are generated from your real data - no mock data is used.
              </p>
              <Button onClick={() => window.location.href = '/upload'}>
                Upload Your Diamond Inventory
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="profitability" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Profitability</span>
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Market</span>
              </TabsTrigger>
              <TabsTrigger value="velocity" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Velocity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <InsightsHeader
                totalDiamonds={totalDiamonds}
                loading={loading}
                onRefresh={handleRefreshAll}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShapeDistributionChart marketTrends={marketTrends} />
                <ShapeAnalysisCard marketTrends={marketTrends} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MarketDemandCard demandInsights={demandInsights} />
                <GroupInsightsCard groupInsights={groupInsights} />
                <PersonalInsightsCard personalInsights={personalInsights} />
              </div>
              
              <QuickStatsGrid 
                totalDiamonds={totalDiamonds}
                marketTrends={marketTrends}
              />
            </TabsContent>

            <TabsContent value="profitability" className="space-y-6">
              {enhancedData?.profitability ? (
                <ProfitabilityInsights data={enhancedData.profitability} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Profitability Data</h3>
                    <p className="text-muted-foreground text-center">
                      Add more diamonds to your inventory to see detailed profitability insights.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-6">
              {enhancedData?.marketComparison ? (
                <MarketComparison data={enhancedData.marketComparison} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Market Data</h3>
                    <p className="text-muted-foreground text-center">
                      Add more diamonds to your inventory to see market comparison insights.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="velocity" className="space-y-6">
              {enhancedData?.inventoryVelocity ? (
                <InventoryVelocity data={enhancedData.inventoryVelocity} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Velocity Data</h3>
                    <p className="text-muted-foreground text-center">
                      Add more diamonds to your inventory to see velocity analysis.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </TelegramLayout>
  );
}
