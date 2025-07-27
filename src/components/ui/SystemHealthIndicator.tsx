
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';

export function SystemHealthIndicator() {
  const { status, isChecking, recheckHealth } = useSystemHealth();
  
  const getHealthIcon = () => {
    if (isChecking) return <Clock className="h-4 w-4 animate-pulse" />;
    
    const criticalErrors = status.errors.length > 0;
    const backendOffline = status.backend === 'offline';
    
    if (criticalErrors || backendOffline) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    
    if (status.warnings.length > 0) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };
  
  const getHealthColor = () => {
    if (isChecking) return 'secondary';
    if (status.errors.length > 0 || status.backend === 'offline') return 'destructive';
    if (status.warnings.length > 0) return 'secondary';
    return 'default';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          {getHealthIcon()}
          <Badge variant={getHealthColor()} className="text-xs">
            {status.backend === 'healthy' ? 'All Systems' : 
             status.backend === 'degraded' ? 'Limited' : 'Offline'}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">System Status</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={recheckHealth}
              disabled={isChecking}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Backend API</span>
              <Badge variant={status.backend === 'healthy' ? 'default' : 'destructive'}>
                {status.backend}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Authentication</span>
              <Badge variant={status.auth === 'authenticated' ? 'default' : 'secondary'}>
                {status.auth}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Features</h5>
            {Object.entries(status.features).map(([feature, working]) => (
              <div key={feature} className="flex justify-between items-center text-sm">
                <span className="capitalize">{feature}</span>
                <Badge variant={working ? 'default' : 'secondary'} className="text-xs">
                  {working ? 'Active' : 'Limited'}
                </Badge>
              </div>
            ))}
          </div>
          
          {status.errors.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-destructive">Critical Issues</h5>
              {status.errors.map((error, index) => (
                <p key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </p>
              ))}
            </div>
          )}
          
          {status.warnings.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-orange-600">Warnings</h5>
              {status.warnings.map((warning, index) => (
                <p key={index} className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
