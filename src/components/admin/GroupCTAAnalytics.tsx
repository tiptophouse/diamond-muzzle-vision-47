
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, MousePointer, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface CTAAnalytics {
  totalClicks: number;
  clicksByDay: Record<string, number>;
  uniqueUsers: number;
  data: any[];
}

export function GroupCTAAnalytics() {
  const [analytics, setAnalytics] = useState<CTAAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching Group CTA Analytics...');
      
      // First try to fetch directly from the table
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysFilter);

      const { data: directData, error: directError } = await supabase
        .from('group_cta_clicks')
        .select('*')
        .gte('clicked_at', fromDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (directError) {
        console.error('❌ Direct query error:', directError);
        throw directError;
      }

      console.log('✅ Direct query successful, data:', directData);

      // Process the data
      const clicksByDay: Record<string, number> = {};
      for (const click of directData || []) {
        const d = new Date(click.clicked_at);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        clicksByDay[key] = (clicksByDay[key] || 0) + 1;
      }

      const uniqueUsers = new Set((directData || []).map((c: any) => c.telegram_id)).size;

      const analyticsData = {
        totalClicks: directData?.length || 0,
        uniqueUsers,
        clicksByDay,
        data: directData || [],
      };

      console.log('📊 Processed analytics:', analyticsData);
      setAnalytics(analyticsData);

      if (analyticsData.totalClicks === 0) {
        toast({
          title: "📊 No CTA Data",
          description: "No group CTA clicks recorded yet. Send a group message with a start button to begin tracking.",
          duration: 4000,
        });
      } else {
        toast({
          title: "✅ Analytics Updated",
          description: `Found ${analyticsData.totalClicks} clicks from ${analyticsData.uniqueUsers} users`,
          duration: 3000,
        });
      }

    } catch (err) {
      console.error('❌ Error fetching CTA analytics:', err);
      toast({
        title: "❌ Analytics Error",
        description: "Failed to fetch group CTA analytics. Check console for details.",
        variant: "destructive",
      });
      setAnalytics({ totalClicks: 0, clicksByDay: {}, uniqueUsers: 0, data: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [daysFilter]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchAnalytics();
  };

  const testCTAClick = async () => {
    try {
      console.log('🧪 Testing CTA click insertion...');
      
      const { data, error } = await supabase
        .from('group_cta_clicks')
        .insert({
          telegram_id: 123456789,
          start_parameter: 'test_group_activation',
          source_group_id: -1001009290613,
          user_agent: navigator.userAgent
        })
        .select();

      if (error) {
        console.error('❌ Test insert error:', error);
        toast({
          title: "❌ Test Failed",
          description: `Test CTA click failed: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('✅ Test insert successful:', data);
        toast({
          title: "✅ Test Successful",
          description: "Test CTA click recorded successfully",
        });
        // Refresh analytics after test
        setTimeout(fetchAnalytics, 1000);
      }
    } catch (err) {
      console.error('❌ Test error:', err);
      toast({
        title: "❌ Test Error",
        description: "Failed to test CTA click functionality",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Group CTA Analytics</CardTitle>
          <CardDescription>Loading click analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Group CTA Analytics
          </CardTitle>
          <CardDescription>
            Track how many users clicked the start button from group messages
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={daysFilter} 
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={testCTAClick}>
            Test
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics?.totalClicks || 0}</p>
          </div>
          
          <div className="bg-secondary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Unique Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{analytics?.uniqueUsers || 0}</p>
          </div>
          
          <div className="bg-accent/10 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {analytics?.totalClicks && analytics.uniqueUsers 
                ? `${((analytics.uniqueUsers / analytics.totalClicks) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>

        {/* Daily Breakdown */}
        {analytics?.clicksByDay && Object.keys(analytics.clicksByDay).length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(analytics.clicksByDay)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                    <span className="text-sm">{day}</span>
                    <Badge variant="secondary">{count} clicks</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Clicks */}
        {analytics?.data && analytics.data.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recent Clicks</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {analytics.data.slice(0, 10).map((click) => (
                <div key={click.id} className="flex items-center justify-between py-2 px-3 border rounded text-sm">
                  <div>
                    <span className="font-medium">User {click.telegram_id}</span>
                    <span className="text-muted-foreground ml-2">
                      {format(new Date(click.clicked_at), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {click.start_parameter}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics?.totalClicks === 0 && (
          <div className="text-center py-8">
            <MousePointer className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No group CTA clicks recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Send a group message with a start button to begin tracking
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Troubleshooting:</strong> If you've sent group messages but see no data:
              </p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                <li>• Check if users are actually clicking the start button</li>
                <li>• Verify the bot has proper permissions in the group</li>
                <li>• Ensure the start parameter is 'group_activation'</li>
                <li>• Check the console logs for tracking errors</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
