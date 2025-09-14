import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TelegramHeatMapGrid } from '@/components/heatmap/TelegramHeatMapGrid';
import { useNotificationHeatMap } from '@/hooks/useNotificationHeatMap';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Flame, TrendingUp, Eye, Grid3X3, RefreshCw } from 'lucide-react';

export function MobileTelegramHeatMap() {
  const [refreshing, setRefreshing] = useState(false);
  const { impactOccurred, selectionChanged } = useTelegramHapticFeedback();
  
  const { 
    heatMapData, 
    isLoading, 
    getHotDiamonds, 
    getHeatMapStats,
    refreshData 
  } = useNotificationHeatMap();

  const stats = getHeatMapStats();
  const hotDiamonds = getHotDiamonds();

  const handleRefresh = async () => {
    setRefreshing(true);
    impactOccurred('light');
    await refreshData();
    setRefreshing(false);
    selectionChanged();
  };

  const handleHotDiamondTap = (diamond: any) => {
    impactOccurred('medium');
    // Could navigate to diamond details or show more info
    console.log('Hot diamond selected:', diamond);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-24 h-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg p-3 animate-pulse">
              <div className="w-full h-4 bg-muted-foreground/20 rounded mb-2" />
              <div className="w-8 h-6 bg-muted-foreground/20 rounded" />
            </div>
          ))}
        </div>
        
        <div className="w-full h-40 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Heat Map</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-10 h-10 p-0 touch-manipulation"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Grid3X3 className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Total</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.totalDiamonds}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/20">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-red-700">Hot</span>
            </div>
            <div className="text-lg font-bold text-red-600">{stats.hotDiamonds}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/20">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-700">Views</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{stats.totalNotifications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Hot Diamonds Alert - Mobile Optimized */}
      {hotDiamonds.length > 0 && (
        <Card className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border-red-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-800 text-sm">
                🔥 {hotDiamonds.length} Hot Diamond{hotDiamonds.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-2">
              {hotDiamonds.slice(0, 3).map((diamond) => (
                <button
                  key={diamond.id}
                  onClick={() => handleHotDiamondTap(diamond)}
                  className="w-full flex items-center justify-between p-2 bg-white/50 rounded-lg border border-red-200/30 touch-manipulation active:scale-95 transition-transform"
                  style={{ minHeight: '44px' }}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm text-red-900">
                      {diamond.shape} {diamond.carat}ct
                    </div>
                    <div className="text-xs text-red-700">
                      ${diamond.price?.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {diamond.notificationCount}
                  </Badge>
                </button>
              ))}
              
              {hotDiamonds.length > 3 && (
                <div className="text-center py-2">
                  <Badge variant="outline" className="text-xs text-red-600">
                    +{hotDiamonds.length - 3} more hot diamonds
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Heat Map Grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {heatMapData.length > 0 ? (
            <div className="relative">
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Interest
                </Badge>
              </div>
              
              <TelegramHeatMapGrid 
                diamonds={heatMapData} 
                onDiamondSelect={(diamond) => {
                  impactOccurred('light');
                  console.log('Selected diamond:', diamond);
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Flame className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-foreground mb-2">No Heat Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Heat map will show customer interest as they interact with your diamonds.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {heatMapData.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              impactOccurred('light');
              // Navigate to detailed analytics
            }}
            className="touch-manipulation h-11 text-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              impactOccurred('light');
              // Navigate to notifications
            }}
            className="touch-manipulation h-11 text-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            All Views
          </Button>
        </div>
      )}
    </div>
  );
}