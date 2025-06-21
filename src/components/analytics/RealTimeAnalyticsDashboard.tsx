
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock, DollarSign, Diamond, Eye, Activity } from 'lucide-react';
import { realTimeAnalyticsService, InventoryAnalytics } from '@/services/realTimeAnalyticsService';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function RealTimeAnalyticsDashboard() {
  const { user } = useTelegramAuth();
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    try {
      const data = await realTimeAnalyticsService.getInventoryAnalytics();
      setAnalytics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTopColors = () => {
    if (!analytics?.colorDistribution) return [];
    return Object.entries(analytics.colorDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getTopClarities = () => {
    if (!analytics?.clarityDistribution) return [];
    return Object.entries(analytics.clarityDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getTopShapes = () => {
    if (!analytics?.shapeDistribution) return [];
    return Object.entries(analytics.shapeDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse text-green-500" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diamonds</CardTitle>
            <Diamond className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalDiamonds || 0}</div>
            <p className="text-xs text-muted-foreground">
              In your inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Portfolio value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics?.averagePrice || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Per diamond
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Status</CardTitle>
            <Eye className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default" className="bg-green-600">
                Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Color Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Colors</CardTitle>
            <CardDescription>Most common diamond colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopColors().map(([color, count]) => (
                <div key={color} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">{color}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clarity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Clarities</CardTitle>
            <CardDescription>Most common clarities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopClarities().map(([clarity, count]) => (
                <div key={clarity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">{clarity}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shape Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Shapes</CardTitle>
            <CardDescription>Most popular shapes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopShapes().map(([shape, count]) => (
                <div key={shape} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium">{shape}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price and Carat Ranges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price Ranges</CardTitle>
            <CardDescription>Distribution by price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Under $1,000</span>
                <Badge variant="outline">{analytics?.priceRanges.under_1000 || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">$1,000 - $5,000</span>
                <Badge variant="outline">{analytics?.priceRanges['1000_to_5000'] || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">$5,000 - $10,000</span>
                <Badge variant="outline">{analytics?.priceRanges['5000_to_10000'] || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Over $10,000</span>
                <Badge variant="outline">{analytics?.priceRanges.over_10000 || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Carat Ranges</CardTitle>
            <CardDescription>Distribution by weight</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Under 1 carat</span>
                <Badge variant="outline">{analytics?.caratRanges.under_1 || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">1 - 2 carats</span>
                <Badge variant="outline">{analytics?.caratRanges['1_to_2'] || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">2 - 3 carats</span>
                <Badge variant="outline">{analytics?.caratRanges['2_to_3'] || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Over 3 carats</span>
                <Badge variant="outline">{analytics?.caratRanges.over_3 || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
