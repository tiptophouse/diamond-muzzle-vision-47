import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Activity, 
  Server, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronDown,
  ExternalLink 
} from 'lucide-react';
import { useApiHealthCheck } from '@/hooks/useApiHealthCheck';
import { API_BASE_URL } from '@/lib/api';

export function ApiStatusIndicator() {
  const { healthCheck, isChecking, runHealthCheck } = useApiHealthCheck();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'testing':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="h-5 w-5 text-primary" />
            FastAPI Backend Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={getStatusColor(healthCheck.isHealthy ? 'success' : 'error')}
            >
              {healthCheck.isHealthy ? 'Online' : 'Offline'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={runHealthCheck}
              disabled={isChecking}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-lg">
              {healthCheck.endpoints.filter(e => e.status === 'success').length}
            </div>
            <div className="text-muted-foreground">Healthy</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">
              {healthCheck.overallResponseTime}ms
            </div>
            <div className="text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">
              {healthCheck.endpoints.length}
            </div>
            <div className="text-muted-foreground">Total Endpoints</div>
          </div>
        </div>

        {/* Backend URL */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Backend:</span>
          <code className="px-2 py-1 bg-muted/50 rounded text-xs">{API_BASE_URL}</code>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => window.open(API_BASE_URL, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        {/* Last Checked */}
        {healthCheck.lastChecked && (
          <div className="text-xs text-muted-foreground">
            Last checked: {healthCheck.lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Detailed Endpoint Status */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>Endpoint Details</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {healthCheck.endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  {getStatusIcon(endpoint.status)}
                  <span className="text-sm font-medium">{endpoint.endpoint}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {endpoint.responseTime && (
                    <span>{endpoint.responseTime}ms</span>
                  )}
                  {endpoint.error && (
                    <span className="text-destructive max-w-32 truncate" title={endpoint.error}>
                      {endpoint.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}