
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightsHeader } from "@/components/insights/InsightsHeader";
import { ShapeDistributionChart } from "@/components/insights/ShapeDistributionChart";
import { ShapeAnalysisCard } from "@/components/insights/ShapeAnalysisCard";
import { QuickStatsGrid } from "@/components/insights/QuickStatsGrid";
import { useInsightsData } from "@/hooks/useInsightsData";

export default function InsightsPage() {
  const {
    loading,
    marketTrends,
    totalDiamonds,
    fetchRealInsights,
    isAuthenticated
  } = useInsightsData();
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please authenticate to view insights.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Market Insights</h1>
            <p className="text-muted-foreground">Real-time analytics from your inventory</p>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diamond-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing your inventory...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <InsightsHeader
          totalDiamonds={totalDiamonds}
          loading={loading}
          onRefresh={fetchRealInsights}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShapeDistributionChart marketTrends={marketTrends} />
          <ShapeAnalysisCard marketTrends={marketTrends} />
        </div>
        
        {totalDiamonds > 0 && (
          <QuickStatsGrid 
            totalDiamonds={totalDiamonds}
            marketTrends={marketTrends}
          />
        )}
      </div>
    </Layout>
  );
}
