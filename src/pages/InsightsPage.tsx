
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Gem } from 'lucide-react';
import { useEnhancedInsights } from '@/hooks/useEnhancedInsights';

export default function InsightsPage() {
  const { insights, loading, error, refetch, isAuthenticated } = useEnhancedInsights();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please authenticate to view insights.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Insights</h1>
          <p className="text-muted-foreground">Analyze your diamond inventory performance</p>
        </div>
        <Button onClick={refetch} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diamonds</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalDiamonds}</div>
            <p className="text-xs text-muted-foreground">In your inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Shape</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.marketTrends[0]?.category || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.marketTrends[0]?.percentage || 0}% of inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shapes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.marketTrends.length}</div>
            <p className="text-xs text-muted-foreground">Different shapes</p>
          </CardContent>
        </Card>
      </div>

      {insights.marketTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Shape Distribution</CardTitle>
            <CardDescription>Breakdown of diamond shapes in your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.marketTrends.map((trend, index) => (
                <div key={trend.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{trend.category}</p>
                    <p className="text-sm text-muted-foreground">{trend.count} diamonds</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{trend.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {insights.profitabilityInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profitability Analysis</CardTitle>
            <CardDescription>Average pricing by shape</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.profitabilityInsights.map((insight, index) => (
                <div key={insight.shape} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{insight.shape}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: ${insight.avgPrice.toFixed(0)}/ct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +{insight.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading insights...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
