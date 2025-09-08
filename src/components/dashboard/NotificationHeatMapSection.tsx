import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TelegramHeatMapGrid } from '@/components/heatmap/TelegramHeatMapGrid';
import { useNotificationHeatMap } from '@/hooks/useNotificationHeatMap';
import { TrendingUp, Flame, Eye, BarChart3 } from 'lucide-react';

export function NotificationHeatMapSection() {
  const { 
    heatMapData, 
    isLoading, 
    getHotDiamonds, 
    getTrendingDiamonds, 
    getHeatMapStats 
  } = useNotificationHeatMap();

  const stats = getHeatMapStats();
  const hotDiamonds = getHotDiamonds();
  const trendingDiamonds = getTrendingDiamonds(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Diamond Interest Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heat Map Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Diamonds</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.totalDiamonds}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Hot Diamonds</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-red-600">{stats.hotDiamonds}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Medium Interest</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-orange-600">{stats.mediumInterest}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Views</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{stats.totalNotifications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Hot Diamonds Alert */}
      {hotDiamonds.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Flame className="h-5 w-5" />
              🔥 Hot Diamonds Alert ({hotDiamonds.length})
            </CardTitle>
            <CardDescription className="text-red-700">
              These diamonds are receiving high interest from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotDiamonds.slice(0, 5).map((diamond) => (
                <Badge key={diamond.id} variant="destructive" className="text-xs">
                  {diamond.shape} {diamond.carat}ct ({diamond.notificationCount} views)
                </Badge>
              ))}
              {hotDiamonds.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{hotDiamonds.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Diamond Interest Heat Map
          </CardTitle>
          <CardDescription>
            Visual representation of customer interest in your diamonds. Red = High interest, Orange = Medium, Gray = Low
          </CardDescription>
        </CardHeader>
        <CardContent>
          {heatMapData.length > 0 ? (
            <TelegramHeatMapGrid 
              diamonds={heatMapData} 
              onDiamondSelect={(diamond) => console.log('Selected diamond:', diamond)}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Flame className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No heat map data available yet.</p>
              <p className="text-sm">Heat map will appear as customers interact with your diamonds.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}