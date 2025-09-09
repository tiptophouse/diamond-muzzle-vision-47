import React, { useState, useEffect } from 'react';
import { telegramImageCache } from '@/services/telegramImageCache';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Database, Zap, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

interface CacheStats {
  count: number;
  totalSize: string;
}

export function TelegramImageCacheManager() {
  const [cacheStats, setCacheStats] = useState<CacheStats>({ count: 0, totalSize: '0MB' });
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { haptic } = useTelegramSDK();

  const loadCacheStats = async () => {
    try {
      const stats = await telegramImageCache.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      setIsClearing(true);
      haptic?.impact?.('medium');
      
      await telegramImageCache.clearCache();
      await loadCacheStats();
      
      haptic?.notification?.('success');
      toast.success('🗑️ Image cache cleared successfully', {
        description: 'All cached images have been removed from Telegram storage'
      });
    } catch (error) {
      haptic?.notification?.('error');
      toast.error('Failed to clear cache', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefreshStats = async () => {
    try {
      setIsRefreshing(true);
      haptic?.impact?.('light');
      await loadCacheStats();
      haptic?.selection?.();
    } catch (error) {
      haptic?.notification?.('error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-5 w-5 text-primary" />
          Telegram Image Cache
          <Badge variant="outline" className="ml-auto">
            Native Storage
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cache Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Cached Images</span>
            </div>
            <div className="text-2xl font-bold text-primary">{cacheStats.count}</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Storage Used</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{cacheStats.totalSize}</div>
          </div>
        </div>

        {/* Cache Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-3 border border-blue-200/30">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Native Telegram Storage Active
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">
                Diamond images are cached in Telegram's secure cloud storage for instant loading and offline viewing.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStats}
            disabled={isRefreshing}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
            disabled={isClearing || cacheStats.count === 0}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </Button>
        </div>

        {/* Cache Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• Images are automatically cached when first loaded</p>
          <p>• Cache expires after 24 hours for fresh content</p>
          <p>• Maximum 50 images cached at once</p>
          <p>• Uses Telegram's native CloudStorage API</p>
        </div>
      </CardContent>
    </Card>
  );
}