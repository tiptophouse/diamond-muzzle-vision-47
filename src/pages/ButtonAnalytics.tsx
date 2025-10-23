import { useState, useEffect } from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { BarChart3, MousePointer, Users, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ButtonClickStat {
  button_id: string;
  button_label: string;
  click_count: number;
  unique_users: number;
  last_clicked: string;
  page_path?: string;
}

interface RecentClick {
  id: string;
  button_id: string;
  button_label: string;
  user_name: string;
  page_path: string;
  clicked_at: string;
  telegram_id: number;
}

export default function ButtonAnalytics() {
  const [buttonStats, setButtonStats] = useState<ButtonClickStat[]>([]);
  const [recentClicks, setRecentClicks] = useState<RecentClick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const timeRangeMap = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const startTime = new Date(now.getTime() - timeRangeMap[timeRange]);

      // Fetch button statistics
      const { data: clickData, error: clickError } = await supabase
        .from('button_click_events')
        .select('*')
        .gte('clicked_at', startTime.toISOString())
        .order('clicked_at', { ascending: false });

      if (clickError) throw clickError;

      // Process statistics
      const statsMap = new Map<string, ButtonClickStat>();
      const usersByButton = new Map<string, Set<number>>();

      clickData?.forEach((click) => {
        const key = click.button_id;
        
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            button_id: click.button_id,
            button_label: click.button_label,
            click_count: 0,
            unique_users: 0,
            last_clicked: click.clicked_at,
            page_path: click.page_path,
          });
          usersByButton.set(key, new Set());
        }

        const stat = statsMap.get(key)!;
        stat.click_count++;
        usersByButton.get(key)!.add(click.telegram_id);

        if (new Date(click.clicked_at) > new Date(stat.last_clicked)) {
          stat.last_clicked = click.clicked_at;
        }
      });

      // Update unique users count
      statsMap.forEach((stat, key) => {
        stat.unique_users = usersByButton.get(key)!.size;
      });

      const sortedStats = Array.from(statsMap.values())
        .sort((a, b) => b.click_count - a.click_count);

      setButtonStats(sortedStats);

      // Recent clicks (last 20)
      const recent = clickData?.slice(0, 20).map(click => ({
        id: click.id,
        button_id: click.button_id,
        button_label: click.button_label,
        user_name: click.user_name,
        page_path: click.page_path,
        clicked_at: click.clicked_at,
        telegram_id: click.telegram_id,
      })) || [];

      setRecentClicks(recent);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: 'Error loading analytics',
        description: 'Failed to fetch button click data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const totalClicks = buttonStats.reduce((sum, stat) => sum + stat.click_count, 0);
  const totalButtons = buttonStats.length;
  const totalUniqueUsers = new Set(recentClicks.map(c => c.telegram_id)).size;

  return (
    <TelegramMiniAppLayout>
      <div className="space-y-6 p-4 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MousePointer className="h-6 w-6 text-primary" />
              Button Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Track and analyze button click performance
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '1h' && 'Last Hour'}
              {range === '24h' && 'Last 24h'}
              {range === '7d' && 'Last 7 Days'}
              {range === '30d' && 'Last 30 Days'}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{totalButtons}</p>
                  <p className="text-xs text-muted-foreground">Buttons Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{totalUniqueUsers}</p>
                  <p className="text-xs text-muted-foreground">Unique Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {totalButtons > 0 ? (totalClicks / totalButtons).toFixed(1) : '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg per Button</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Button Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Button Performance</CardTitle>
            <CardDescription>Click counts by button</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading analytics...
              </div>
            ) : buttonStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No button clicks recorded yet
              </div>
            ) : (
              <div className="space-y-3">
                {buttonStats.map((stat, index) => (
                  <div
                    key={stat.button_id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <p className="font-semibold truncate">{stat.button_label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {stat.button_id} • {stat.page_path}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{stat.click_count}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-500">{stat.unique_users}</p>
                        <p className="text-xs text-muted-foreground">users</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clicks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest button clicks</CardDescription>
          </CardHeader>
          <CardContent>
            {recentClicks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent clicks
              </div>
            ) : (
              <div className="space-y-2">
                {recentClicks.map((click) => (
                  <div
                    key={click.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{click.button_label}</p>
                      <p className="text-xs text-muted-foreground">
                        by {click.user_name} • {click.page_path}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(click.clicked_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TelegramMiniAppLayout>
  );
}
