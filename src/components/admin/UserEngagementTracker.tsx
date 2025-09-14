import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingUp, Users, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EngagementMetrics {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  newSignups7Days: number;
  usersWithUploads: number;
  avgSessionTime: number;
  botInteractions24h: number;
  inactiveUsers: number;
}

export function UserEngagementTracker() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEngagementMetrics = async () => {
    try {
      setIsLoading(true);

      // Get user analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*');

      if (analyticsError) throw analyticsError;

      // Get user profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get bot usage analytics
      const { data: botUsage, error: botError } = await supabase
        .from('bot_usage_analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (botError) throw botError;

      // Get recent user sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('session_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (sessionsError) throw sessionsError;

      // Calculate metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const activeToday = (sessions || []).filter(s => 
        new Date(s.session_start) >= today
      ).length;

      const activeThisWeek = (sessions || []).length;

      const newSignups = (profiles || []).filter(p => 
        new Date(p.created_at) >= weekAgo
      ).length;

      const usersWithUploads = (profiles || []).filter(p => 
        (analytics || []).some(a => a.telegram_id === p.telegram_id && a.api_calls_count > 0)
      ).length;

      const totalSessionTime = (sessions || []).reduce((sum, s) => {
        return sum + (s.total_duration ? parseInt(String(s.total_duration)) / 1000 : 0);
      }, 0);

      const avgSessionTime = sessions?.length ? totalSessionTime / sessions.length : 0;

      const inactiveUsers = (profiles || []).filter(p => {
        const lastActive = new Date(p.updated_at || p.created_at);
        const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActive > 7;
      }).length;

      setMetrics({
        totalUsers: profiles?.length || 0,
        activeToday,
        activeThisWeek,
        newSignups7Days: newSignups,
        usersWithUploads,
        avgSessionTime,
        botInteractions24h: botUsage?.length || 0,
        inactiveUsers
      });

    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      toast({
        title: "Error Loading Metrics",
        description: "Failed to load engagement data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const triggerEngagementCampaign = async () => {
    try {
      setIsRefreshing(true);

      // Trigger user engagement monitoring
      const { error } = await supabase.functions.invoke('user-engagement-monitor', {
        body: { trigger: 'manual_admin_trigger' }
      });

      if (error) throw error;

      toast({
        title: "🚀 Engagement Campaign Triggered",
        description: "Users who need guidance will receive targeted messages",
      });

      // Refresh metrics after a delay
      setTimeout(fetchEngagementMetrics, 2000);

    } catch (error) {
      console.error('Error triggering engagement campaign:', error);
      toast({
        title: "Campaign Failed",
        description: "Could not trigger the engagement campaign",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEngagementMetrics();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading engagement metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load engagement data
          </div>
        </CardContent>
      </Card>
    );
  }

  const engagementRate = metrics.totalUsers > 0 ? (metrics.activeThisWeek / metrics.totalUsers) * 100 : 0;
  const uploadRate = metrics.totalUsers > 0 ? (metrics.usersWithUploads / metrics.totalUsers) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          User Engagement Analytics
        </CardTitle>
        <CardDescription>
          Real-time insights into user activity and engagement patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{metrics.activeToday}</div>
            <div className="text-sm text-muted-foreground">Active Today</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{metrics.newSignups7Days}</div>
            <div className="text-sm text-muted-foreground">New This Week</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{metrics.inactiveUsers}</div>
            <div className="text-sm text-muted-foreground">Inactive Users</div>
          </div>
        </div>

        {/* Engagement Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Weekly Engagement Rate</span>
              <span className="text-sm text-muted-foreground">{engagementRate.toFixed(1)}%</span>
            </div>
            <Progress value={engagementRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {metrics.activeThisWeek} of {metrics.totalUsers} users active this week
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Upload Adoption Rate</span>
              <span className="text-sm text-muted-foreground">{uploadRate.toFixed(1)}%</span>
            </div>
            <Progress value={uploadRate} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {metrics.usersWithUploads} users have uploaded inventory
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Avg Session</span>
            </div>
            <div className="text-lg font-bold">{Math.round(metrics.avgSessionTime)}s</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Bot Interactions</span>
            </div>
            <div className="text-lg font-bold">{metrics.botInteractions24h}</div>
            <div className="text-xs text-muted-foreground">Last 24h</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Need Attention</span>
            </div>
            <div className="text-lg font-bold">{metrics.inactiveUsers}</div>
            <div className="text-xs text-muted-foreground">Inactive 7+ days</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={fetchEngagementMetrics}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          
          <Button 
            onClick={triggerEngagementCampaign}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isRefreshing ? 'Triggering...' : 'Trigger Re-engagement'}
          </Button>
        </div>

        {/* Alerts */}
        {metrics.inactiveUsers > metrics.totalUsers * 0.3 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">High Inactive Rate Detected</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Over 30% of users are inactive. Consider running a re-engagement campaign.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}