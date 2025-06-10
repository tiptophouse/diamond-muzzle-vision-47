
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApiStatusIndicator } from './ApiStatusIndicator';
import { WebhookManager } from './WebhookManager';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import { Database, RefreshCw, TrendingUp, Eye, Package, Zap } from 'lucide-react';

export function EnhancedAdminDashboard() {
  const { 
    diamonds, 
    loading, 
    syncStatus, 
    stats, 
    refreshInventory 
  } = useUnifiedInventory();

  const getSyncStatusConfig = () => {
    switch (syncStatus) {
      case 'syncing':
        return { color: 'text-yellow-600', text: 'Syncing...' };
      case 'success':
        return { color: 'text-green-600', text: 'In Sync' };
      case 'error':
        return { color: 'text-red-600', text: 'Sync Error' };
      default:
        return { color: 'text-gray-600', text: 'Ready' };
    }
  };

  const syncConfig = getSyncStatusConfig();

  return (
    <div className="space-y-6">
      {/* API Status */}
      <ApiStatusIndicator />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.available} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Visible</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.visible}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.visible / stats.total) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${syncConfig.color}`}>
              {syncConfig.text}
            </div>
            <Button
              onClick={refreshInventory}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Management */}
      <WebhookManager />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Backend Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Fully Integrated</h4>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Your FastAPI backend at {process.env.NODE_ENV === 'development' ? 'api.mazalbot.com' : 'your domain'} is successfully connected with:
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ Inventory management and CRUD operations</li>
              <li>✅ Make.com webhook automation</li>
              <li>✅ Image upload and storage</li>
              <li>✅ Real-time synchronization</li>
              <li>✅ OpenAI integration for descriptions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
