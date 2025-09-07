/**
 * System Health Monitor Component
 * 
 * Displays real-time system status, error rates, and performance metrics
 * Helps with production monitoring and debugging
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  Server,
  Database,
  Shield
} from 'lucide-react';
import { useGlobalLoadingState } from '@/hooks/useLoadingState';
import { errorMonitoring } from '@/services/errorMonitoring';
import { logger } from '@/utils/productionLogger';
import { testBackendHealth } from '@/api/http';

interface SystemHealthProps {
  className?: string;
}

interface HealthMetrics {
  backendStatus: 'healthy' | 'degraded' | 'down' | 'checking';
  networkStatus: 'online' | 'offline';
  errorRate: number;
  lastErrors: string[];
  performanceScore: number;
  uptime: string;
}

export function SystemHealth({ className }: SystemHealthProps) {
  const { isGloballyLoading, allOperations } = useGlobalLoadingState();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    backendStatus: 'checking',
    networkStatus: navigator.onLine ? 'online' : 'offline',
    errorRate: 0,
    lastErrors: [],
    performanceScore: 100,
    uptime: '0m'
  });
  const [startTime] = useState(Date.now());

  // Monitor system health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const backendHealthy = await testBackendHealth();
        const recentLogs = logger.getRecentLogs(10);
        const errorLogs = recentLogs.filter(log => log.level === 'error');
        const errorRate = (errorLogs.length / recentLogs.length) * 100;

        // Calculate uptime
        const uptimeMs = Date.now() - startTime;
        const uptimeMinutes = Math.floor(uptimeMs / 60000);
        const uptimeHours = Math.floor(uptimeMinutes / 60);
        const uptime = uptimeHours > 0 
          ? `${uptimeHours}h ${uptimeMinutes % 60}m`
          : `${uptimeMinutes}m`;

        // Calculate performance score based on various factors
        const performanceScore = Math.max(0, 100 - 
          (errorRate * 2) - 
          (allOperations.length * 5) -
          (backendHealthy ? 0 : 50)
        );

        setMetrics({
          backendStatus: backendHealthy ? 'healthy' : 'down',
          networkStatus: navigator.onLine ? 'online' : 'offline',
          errorRate: Math.round(errorRate),
          lastErrors: errorLogs.slice(0, 3).map(log => log.message),
          performanceScore: Math.round(performanceScore),
          uptime
        });

      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          backendStatus: 'down',
          performanceScore: 50
        }));
      }
    };

    // Initial check
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    // Listen for network changes
    const handleOnline = () => setMetrics(prev => ({ ...prev, networkStatus: 'online' }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, networkStatus: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [startTime, allOperations.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
      case 'offline':
        return 'destructive';
      case 'checking':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleClearErrors = () => {
    logger.clearLogs();
    setMetrics(prev => ({ ...prev, lastErrors: [], errorRate: 0 }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time system status and performance
            </CardDescription>
          </div>
          <Badge 
            variant={getStatusColor(metrics.backendStatus)} 
            className="ml-2"
          >
            {metrics.backendStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Backend</span>
            <Badge variant={getStatusColor(metrics.backendStatus)} size="sm">
              {metrics.backendStatus}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {metrics.networkStatus === 'online' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">Network</span>
            <Badge variant={getStatusColor(metrics.networkStatus)} size="sm">
              {metrics.networkStatus}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Performance Score</span>
            <span className={`text-sm font-bold ${getPerformanceColor(metrics.performanceScore)}`}>
              {metrics.performanceScore}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Uptime
            </span>
            <span className="text-sm">{metrics.uptime}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Error Rate
            </span>
            <span className="text-sm">{metrics.errorRate}%</span>
          </div>
        </div>

        {/* Active Operations */}
        {isGloballyLoading && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  Active Operations ({allOperations.length})
                </span>
              </div>
              <div className="space-y-1">
                {allOperations.slice(0, 3).map((op, index) => (
                  <div key={index} className="text-xs text-muted-foreground ml-4">
                    {op.component ? `[${op.component}] ` : ''}{op.operation}
                  </div>
                ))}
                {allOperations.length > 3 && (
                  <div className="text-xs text-muted-foreground ml-4">
                    +{allOperations.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Recent Errors */}
        {metrics.lastErrors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  Recent Errors
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearErrors}
                  className="text-xs h-6"
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-1">
                {metrics.lastErrors.map((error, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {error.substring(0, 80)}
                    {error.length > 80 ? '...' : ''}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* System Stats */}
        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Session: {errorMonitoring.getSessionStats().sessionId.substring(0, 8)}</div>
          <div>Build: {process.env.NODE_ENV}</div>
        </div>
      </CardContent>
    </Card>
  );
}