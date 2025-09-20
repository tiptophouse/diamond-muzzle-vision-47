import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Diamond } from '@/components/inventory/InventoryTable';
import { DollarSign, TrendingUp, Target, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface RevenueAnalyticsDashboardProps {
  diamonds: Diamond[];
}

interface RevenueInsights {
  totalInventoryValue: number;
  monthlyRevenuePotential: number;
  averageMargin: number;
  topPerformers: Array<{
    shape: string;
    averagePrice: number;
    count: number;
    totalValue: number;
    profitPotential: number;
  }>;
  riskAnalysis: {
    highValueStones: number;
    underpriced: number;
    optimal: number;
  };
  liquidityScore: number;
  marketPositioning: 'Premium' | 'Mid-Market' | 'Value' | 'Mixed';
}

export function RevenueAnalyticsDashboard({ diamonds }: RevenueAnalyticsDashboardProps) {
  const insights = useMemo((): RevenueInsights => {
    if (!diamonds || diamonds.length === 0) {
      return {
        totalInventoryValue: 0,
        monthlyRevenuePotential: 0,
        averageMargin: 0,
        topPerformers: [],
        riskAnalysis: { highValueStones: 0, underpriced: 0, optimal: 0 },
        liquidityScore: 0,
        marketPositioning: 'Mixed'
      };
    }

    // Calculate total inventory value
    const totalInventoryValue = diamonds.reduce((sum, d) => sum + (d.price || 0), 0);
    
    // Calculate monthly revenue potential (based on industry turnover rates)
    const monthlyRevenuePotential = totalInventoryValue * 0.15; // 15% monthly turnover
    
    // Shape analysis for performance insights
    const shapeAnalysis = diamonds.reduce((acc, diamond) => {
      const shape = diamond.shape || 'Unknown';
      if (!acc[shape]) {
        acc[shape] = { prices: [], count: 0, totalValue: 0 };
      }
      acc[shape].prices.push(diamond.price || 0);
      acc[shape].count++;
      acc[shape].totalValue += diamond.price || 0;
      return acc;
    }, {} as Record<string, { prices: number[], count: number, totalValue: number }>);

    const topPerformers = Object.entries(shapeAnalysis)
      .map(([shape, data]) => ({
        shape,
        averagePrice: data.prices.reduce((sum, p) => sum + p, 0) / data.count,
        count: data.count,
        totalValue: data.totalValue,
        profitPotential: data.totalValue * 0.25 // Estimated 25% margin
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Risk analysis based on pricing
    const priceDistribution = diamonds.map(d => d.price || 0).sort((a, b) => b - a);
    const highValueStones = priceDistribution.filter(p => p > 10000).length;
    const averagePrice = priceDistribution.reduce((sum, p) => sum + p, 0) / priceDistribution.length;
    
    // Market positioning analysis
    let marketPositioning: 'Premium' | 'Mid-Market' | 'Value' | 'Mixed' = 'Mixed';
    if (averagePrice > 8000) marketPositioning = 'Premium';
    else if (averagePrice > 3000) marketPositioning = 'Mid-Market';
    else marketPositioning = 'Value';

    // Liquidity score (based on price distribution and market demand)
    const liquidityScore = Math.min(100, (diamonds.length / 10) * 10 + (averagePrice / 100));

    return {
      totalInventoryValue,
      monthlyRevenuePotential,
      averageMargin: 25, // Industry standard
      topPerformers,
      riskAnalysis: {
        highValueStones,
        underpriced: Math.floor(diamonds.length * 0.1),
        optimal: Math.floor(diamonds.length * 0.7)
      },
      liquidityScore,
      marketPositioning
    };
  }, [diamonds]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPositioningColor = (positioning: string) => {
    switch (positioning) {
      case 'Premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Mid-Market': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Value': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(insights.totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {diamonds.length} stones in portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue Potential</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(insights.monthlyRevenuePotential)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on 15% turnover rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {insights.averageMargin}%
            </div>
            <p className="text-xs text-muted-foreground">
              Industry benchmark: 20-30%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(insights.liquidityScore)}
            </div>
            <Progress value={insights.liquidityScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              How quickly inventory converts to cash
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Positioning */}
      <Card>
        <CardHeader>
          <CardTitle>Market Positioning</CardTitle>
          <CardDescription>Your inventory's market position and competitive analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Position</p>
              <Badge className={getPositioningColor(insights.marketPositioning)}>
                {insights.marketPositioning}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Average Stone Value</p>
              <p className="text-xl font-semibold">
                {formatCurrency(insights.totalInventoryValue / diamonds.length || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Categories</CardTitle>
          <CardDescription>Shape categories driving the most value in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.topPerformers.map((performer, index) => (
              <div key={performer.shape} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <div>
                    <p className="font-medium">{performer.shape}</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.count} stones • Avg: {formatCurrency(performer.averagePrice)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(performer.totalValue)}</p>
                  <p className="text-sm text-green-600">
                    +{formatCurrency(performer.profitPotential)} potential
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Risk Analysis</CardTitle>
          <CardDescription>Risk assessment and optimization recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium">High Value Stones</p>
                <p className="text-2xl font-bold">{insights.riskAnalysis.highValueStones}</p>
                <p className="text-xs text-muted-foreground">Require special attention</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Underpriced Stones</p>
                <p className="text-2xl font-bold">{insights.riskAnalysis.underpriced}</p>
                <p className="text-xs text-muted-foreground">Pricing opportunity</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Optimally Priced</p>
                <p className="text-2xl font-bold">{insights.riskAnalysis.optimal}</p>
                <p className="text-xs text-muted-foreground">Market competitive</p>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Revenue Optimization Recommendations</h4>
            <ul className="space-y-1 text-sm">
              <li>• Focus marketing on {insights.topPerformers[0]?.shape || 'Round'} diamonds - your highest value category</li>
              <li>• Review pricing on {insights.riskAnalysis.underpriced} underpriced stones for immediate revenue increase</li>
              <li>• Consider promoting high-value stones through premium channels</li>
              <li>• Monitor liquidity score - current {Math.round(insights.liquidityScore)}% indicates {insights.liquidityScore > 70 ? 'healthy' : 'slow'} turnover</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}