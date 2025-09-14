import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { telegramPerformanceMonitor } from '@/services/telegramPerformanceMonitor';
import { telegramInventoryCache } from '@/services/telegramInventoryCache';
import { useAdvancedTelegramOptimization } from '@/hooks/useAdvancedTelegramOptimization';
import { getCurrentUserId } from '@/lib/api';

export function PerformanceDashboard() {
  const optimization = useAdvancedTelegramOptimization();
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const report = telegramPerformanceMonitor.generatePerformanceReport();
      const stats = await telegramInventoryCache.getCacheStats();
      
      setPerformanceData(report);
      setCacheStats(stats);
    };

    loadData();
    const interval = setInterval(loadData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance Overview
            <Badge className={`${getStatusColor(optimization.performanceStatus.status)} text-white`}>
              {optimization.performanceStatus.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {optimization.performanceScore}
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTime(performanceData.authTime)}
              </div>
              <div className="text-sm text-muted-foreground">Auth Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTime(performanceData.inventoryLoad)}
              </div>
              <div className="text-sm text-muted-foreground">Load Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(performanceData.cacheHitRate)}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'SDK Optimized', status: optimization.isOptimized },
              { name: 'Network Optimized', status: optimization.networkOptimized },
              { name: 'Memory Optimized', status: optimization.memoryOptimized },
              { name: 'Battery Optimized', status: optimization.batteryOptimized },
              { name: 'Cache Efficient', status: optimization.cacheEfficiency > 70 },
              { name: 'Performance Monitored', status: true }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{item.name}</span>
                <Badge variant={item.status ? 'default' : 'secondary'}>
                  {item.status ? '✓' : '○'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{cacheStats.totalKeys}</div>
                <div className="text-sm text-muted-foreground">Total Keys</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{cacheStats.inventoryKeys}</div>
                <div className="text-sm text-muted-foreground">Inventory Keys</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{cacheStats.totalSize}</div>
                <div className="text-sm text-muted-foreground">Cache Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Issues */}
      {optimization.performanceStatus.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Performance Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {optimization.performanceStatus.issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm text-orange-800">{issue}</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Issue
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {optimization.performanceStatus.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {optimization.performanceStatus.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm text-blue-800">{rec}</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Tip
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={optimization.reinitialize}
              variant="outline"
              size="sm"
            >
              Reinitialize Optimizations
            </Button>
            <Button 
              onClick={() => {
                const userId = getCurrentUserId() || 0;
                telegramInventoryCache.clearCachedInventory(userId);
              }}
              variant="outline" 
              size="sm"
            >
              Clear Cache
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline" 
              size="sm"
            >
              Force Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      {performanceData.memoryUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(performanceData.memoryUsage)}MB
              </div>
              <div className="text-sm text-muted-foreground">JavaScript Heap</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PerformanceDashboard;