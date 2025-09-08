import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TelegramHeatMapGrid } from '@/components/heatmap/TelegramHeatMapGrid';
import { Advanced3DHeatMap } from '@/components/heatmap/Advanced3DHeatMap';
import { useNotificationHeatMap } from '@/hooks/useNotificationHeatMap';
import { TrendingUp, Flame, Eye, BarChart3, Box, Grid3X3, Zap } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

export function NotificationHeatMapSection() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const { impactOccurred, selectionChanged } = useTelegramHapticFeedback();
  
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

  const handleViewModeToggle = () => {
    const newMode = viewMode === '2d' ? '3d' : '2d';
    setViewMode(newMode);
    
    // Telegram haptic feedback
    if (newMode === '3d') {
      impactOccurred('heavy'); // Strong feedback for 3D mode
    } else {
      selectionChanged(); // Light feedback for 2D mode
    }
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <CardTitle>Diamond Interest Heat Map</CardTitle>
              {viewMode === '3d' && (
                <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Zap className="h-3 w-3 mr-1" />
                  Level 2000
                </Badge>
              )}
            </div>
            
            {/* 2D/3D Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === '2d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('2d');
                  selectionChanged();
                }}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                2D
              </Button>
              <Button
                variant={viewMode === '3d' ? 'default' : 'outline'}
                size="sm"
                onClick={handleViewModeToggle}
                className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Box className="h-4 w-4 mr-1" />
                3D
              </Button>
            </div>
          </div>
          <CardDescription>
            {viewMode === '2d' 
              ? 'Visual representation of customer interest in your diamonds. Red = High interest, Orange = Medium, Gray = Low'
              : 'Advanced 3D visualization with real-time animations, interactive diamond models, and immersive depth perception'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {heatMapData.length > 0 ? (
            viewMode === '2d' ? (
              <TelegramHeatMapGrid 
                diamonds={heatMapData} 
                onDiamondSelect={(diamond) => console.log('Selected diamond:', diamond)}
              />
            ) : (
              <Advanced3DHeatMap
                diamonds={heatMapData}
                onDiamondSelect={(diamond) => {
                  console.log('Selected 3D diamond:', diamond);
                  impactOccurred('medium');
                }}
                height={500}
                interactive={true}
              />
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex justify-center mb-4">
                {viewMode === '2d' ? (
                  <Flame className="h-12 w-12 opacity-20" />
                ) : (
                  <div className="relative">
                    <Box className="h-12 w-12 opacity-20" />
                    <Zap className="h-6 w-6 absolute -top-1 -right-1 text-purple-500 opacity-60" />
                  </div>
                )}
              </div>
              <p className="font-medium">No heat map data available yet.</p>
              <p className="text-sm">Heat map will appear as customers interact with your diamonds.</p>
              {viewMode === '3d' && (
                <p className="text-xs text-purple-400 mt-2">
                  ✨ 3D mode features floating diamonds, particle effects, and immersive interactions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}