import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeepLinkAnalytics } from '@/hooks/useDeepLinkAnalytics';
import { useTelegramCloudStorage } from '@/hooks/useTelegramCloudStorage';
import { RefreshCw, Activity } from 'lucide-react';

export function DeepLinkDebug() {
  const { getAnalyticsStats, isAvailable } = useDeepLinkAnalytics();
  const { getKeys, getItem, isSupported } = useTelegramCloudStorage();
  const [stats, setStats] = useState<any>(null);
  const [detailedStats, setDetailedStats] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get basic stats
      const basicStats = await getAnalyticsStats();
      setStats(basicStats);

      // Get detailed stats from cloud storage
      if (isSupported) {
        const keys = await getKeys();
        const statsKeys = keys.filter(k => k.startsWith('stats/'));
        
        const detailed: Record<string, string> = {};
        for (const key of statsKeys) {
          const value = await getItem(key);
          if (value) {
            detailed[key] = value;
          }
        }
        setDetailedStats(detailed);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!isAvailable && !isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Debug</CardTitle>
          <CardDescription>Analytics not available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Telegram SDK analytics features are not available in this environment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Deep Link Analytics
          </CardTitle>
          <CardDescription>SDK 2.0 Cloud Storage Stats</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">App Opens</p>
              <p className="text-2xl font-bold">{stats.app_opens}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Deep Links</p>
              <p className="text-2xl font-bold">{stats.deep_link_total}</p>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        {Object.keys(detailedStats).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Detailed Counters</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(detailedStats).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-xs font-mono text-muted-foreground">
                    {key.replace('stats/', '')}
                  </span>
                  <Badge variant="secondary">{value}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
