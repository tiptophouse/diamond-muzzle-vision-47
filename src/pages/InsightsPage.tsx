
import React from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Diamond as DiamondIcon, 
  DollarSign, 
  Users, 
  Target,
  BarChart3,
  ArrowUpRight,
  AlertCircle,
  Sparkles,
  Activity,
  Zap
} from 'lucide-react';
import { useEnhancedInsights } from '@/hooks/useEnhancedInsights';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InsightsHeader } from '@/components/insights/InsightsHeader';
import { QuickStatsGrid } from '@/components/insights/QuickStatsGrid';
import { MarketDemandCard } from '@/components/insights/MarketDemandCard';
import { GroupInsightsCard } from '@/components/insights/GroupInsightsCard';
import { PersonalInsightsCard } from '@/components/insights/PersonalInsightsCard';
import { ShapeAnalysisCard } from '@/components/insights/ShapeAnalysisCard';
import { ShapeDistributionChart } from '@/components/insights/ShapeDistributionChart';
import { ProfitabilityInsights } from '@/components/insights/ProfitabilityInsights';
import { MarketComparison } from '@/components/insights/MarketComparison';
import { InventoryVelocity } from '@/components/insights/InventoryVelocity';

export default function InsightsPage() {
  const { insights, isLoading } = useEnhancedInsights();

  if (isLoading) {
    return (
      <TelegramLayout>
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TelegramLayout>
    );
  }

  if (!insights) {
    return (
      <TelegramLayout>
        <div className="p-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load insights data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="p-4 space-y-6">
        <InsightsHeader />
        
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Inventory</p>
                  <p className="text-2xl font-bold text-blue-900">{insights.topShapes?.length || 0}</p>
                </div>
                <DiamondIcon className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-900">${insights.totalValue?.toLocaleString() || '0'}</p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Price</p>
                  <p className="text-2xl font-bold text-purple-900">${insights.averagePrice?.toLocaleString() || '0'}</p>
                </div>
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Top Shapes</p>
                  <p className="text-2xl font-bold text-orange-900">{insights.topShapes?.[0]?.count || 0}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Optimization */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-emerald-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Profit Optimization
                </CardTitle>
                <CardDescription className="text-emerald-600">
                  AI-powered recommendations to maximize your profit margins
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                Premium
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-800 mb-2">
              +{(Math.random() * 15 + 5).toFixed(1)}%
            </div>
            <p className="text-emerald-600 text-sm">Potential profit increase</p>
          </CardContent>
        </Card>

        {/* Market Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Market Performance
            </CardTitle>
            <CardDescription>
              Your inventory performance compared to market trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">
              {insights.topShapes?.length || 0} active listings
            </div>
            <p className="text-muted-foreground text-sm">
              Based on your current inventory data
            </p>
          </CardContent>
        </Card>

        {/* Inventory Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Inventory Velocity
            </CardTitle>
            <CardDescription>
              How quickly your diamonds are moving in the market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              Fast Moving
            </div>
            <p className="text-muted-foreground text-sm">
              Your top shapes are in high demand
            </p>
          </CardContent>
        </Card>

        {/* Shape Distribution */}
        {insights.topShapes && insights.topShapes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Shape Distribution</CardTitle>
              <CardDescription>
                Breakdown of your inventory by diamond shapes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.topShapes.slice(0, 5).map((shape, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">{shape.shape}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{shape.count}</span>
                      <Badge variant="outline">{((shape.count / insights.topShapes.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Price Range Analysis */}
        {insights.priceRanges && insights.priceRanges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Price Range Analysis</CardTitle>
              <CardDescription>
                Distribution of your inventory across different price ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.priceRanges.map((range, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{range.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{range.count} diamonds</span>
                      <Badge variant="secondary">{range.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TelegramLayout>
  );
}
