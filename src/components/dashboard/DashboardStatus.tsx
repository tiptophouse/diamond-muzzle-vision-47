
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, Database, AlertCircle } from "lucide-react";

interface DashboardStatusProps {
  loading: boolean;
  error?: string | null;
  lastUpdate?: Date;
  totalDiamonds: number;
  onRefresh: () => void;
}

export function DashboardStatus({ 
  loading, 
  error, 
  lastUpdate, 
  totalDiamonds, 
  onRefresh 
}: DashboardStatusProps) {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, onRefresh]);

  const getConnectionStatus = () => {
    if (loading) return { status: 'connecting', color: 'yellow', icon: RefreshCw };
    if (error) return { status: 'error', color: 'red', icon: WifiOff };
    return { status: 'connected', color: 'green', icon: Wifi };
  };

  const { status, color, icon: StatusIcon } = getConnectionStatus();

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-medium">FastAPI Connection</span>
            <Badge variant={color === 'green' ? 'default' : color === 'yellow' ? 'secondary' : 'destructive'}>
              {status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Diamonds:</span>
            <span className="font-medium">{totalDiamonds}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Last Update:</span>
            <span className="font-medium">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Auto-refresh:</span>
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`text-xs px-2 py-1 rounded ${
                autoRefreshEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoRefreshEnabled ? `ON (${countdown}s)` : 'OFF'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 col-span-2 lg:col-span-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600 text-xs truncate" title={error}>
                {error.substring(0, 30)}...
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          <span>API: </span>
          <code className="bg-gray-100 px-1 py-0.5 rounded">
            https://api.mazalbot.com/api/v1/get_all_stones?user_id=2138564172
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
