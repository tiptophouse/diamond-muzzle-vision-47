import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemHealth } from '@/hooks/admin/useSystemHealth';
import { Database, Zap, HardDrive, Webhook, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function DashboardSystemHealth() {
  const { health, isLoading } = useSystemHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Checking...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Database */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Database className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">Database</div>
              <div className="text-xs text-muted-foreground">{health.database.responseTime}ms</div>
            </div>
            {getStatusIcon(health.database.status)}
          </div>

          {/* API */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">API</div>
              <div className="text-xs text-muted-foreground">{health.api.responseTime}ms</div>
            </div>
            {getStatusIcon(health.api.status)}
          </div>

          {/* Storage */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">Storage</div>
              <div className="text-xs text-muted-foreground">{health.storage.usedGB}GB used</div>
            </div>
            {getStatusIcon(health.storage.status)}
          </div>

          {/* Webhook */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Webhook className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">Webhook</div>
              <div className="text-xs text-muted-foreground">{health.webhook.lastPing}</div>
            </div>
            {getStatusIcon(health.webhook.status)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
