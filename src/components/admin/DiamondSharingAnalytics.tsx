
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Share2, 
  Clock, 
  Users, 
  TrendingUp, 
  BarChart3,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiamondShare {
  id: string;
  diamond_id: string;
  stock_number: string;
  shared_by: number;
  share_url: string;
  created_at: string;
}

interface DiamondView {
  id: string;
  diamond_id: string;
  session_id: string;
  viewer_telegram_id?: number;
  view_start: string;
  last_interaction?: string;
  total_view_time: number;
  interactions: any;
  reshared: boolean;
  device_type?: string;
  user_agent?: string;
  referrer?: string;
}

interface AnalyticsData {
  totalShares: number;
  totalViews: number;
  uniqueViewers: number;
  avgViewTime: number;
  reshareRate: number;
  topDiamonds: Array<{
    diamond_id: string;
    stock_number: string;
    shares: number;
    views: number;
  }>;
  recentActivity: Array<{
    type: 'share' | 'view';
    diamond_id: string;
    stock_number: string;
    timestamp: string;
    details: string;
  }>;
}

export function DiamondSharingAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const timeAgo = new Date();
      
      switch (timeRange) {
        case '24h':
          timeAgo.setHours(now.getHours() - 24);
          break;
        case '7d':
          timeAgo.setDate(now.getDate() - 7);
          break;
        case '30d':
          timeAgo.setDate(now.getDate() - 30);
          break;
      }

      // Fetch shares data
      const { data: shares, error: sharesError } = await supabase
        .from('diamond_shares')
        .select('*')
        .gte('created_at', timeAgo.toISOString());

      // Fetch views data
      const { data: views, error: viewsError } = await supabase
        .from('diamond_views')
        .select('*')
        .gte('view_start', timeAgo.toISOString());

      if (sharesError) throw sharesError;
      if (viewsError) throw viewsError;

      // Process analytics data
      const sharesData = shares || [];
      const viewsData = views || [];

      // Calculate metrics
      const totalShares = sharesData.length;
      const totalViews = viewsData.length;
      const uniqueViewers = new Set(
        viewsData
          .filter(v => v.viewer_telegram_id)
          .map(v => `${v.viewer_telegram_id}_${v.session_id}`)
      ).size;

      const avgViewTime = viewsData.length > 0 
        ? Math.round(viewsData.reduce((sum, v) => sum + (v.total_view_time || 0), 0) / viewsData.length)
        : 0;

      const reshareCount = viewsData.filter(v => v.reshared).length;
      const reshareRate = viewsData.length > 0 ? (reshareCount / viewsData.length) * 100 : 0;

      // Top diamonds
      const diamondStats = new Map();
      
      sharesData.forEach(share => {
        const key = share.diamond_id;
        if (!diamondStats.has(key)) {
          diamondStats.set(key, {
            diamond_id: share.diamond_id,
            stock_number: share.stock_number,
            shares: 0,
            views: 0
          });
        }
        diamondStats.get(key).shares++;
      });

      viewsData.forEach(view => {
        const key = view.diamond_id;
        if (!diamondStats.has(key)) {
          diamondStats.set(key, {
            diamond_id: view.diamond_id,
            stock_number: view.diamond_id, // fallback
            shares: 0,
            views: 0
          });
        }
        diamondStats.get(key).views++;
      });

      const topDiamonds = Array.from(diamondStats.values())
        .sort((a, b) => (b.shares + b.views) - (a.shares + a.views))
        .slice(0, 10);

      // Recent activity
      const recentActivity = [
        ...sharesData.map(s => ({
          type: 'share' as const,
          diamond_id: s.diamond_id,
          stock_number: s.stock_number,
          timestamp: s.created_at,
          details: `Shared by user ${s.shared_by}`
        })),
        ...viewsData.map(v => ({
          type: 'view' as const,
          diamond_id: v.diamond_id,
          stock_number: v.diamond_id,
          timestamp: v.view_start,
          details: `Viewed for ${Math.round(v.total_view_time || 0)}s, ${
            Array.isArray(v.interactions) ? v.interactions.length : 
            (typeof v.interactions === 'object' && v.interactions !== null) ? Object.keys(v.interactions).length : 0
          } interactions`
        }))
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      setAnalytics({
        totalShares,
        totalViews,
        uniqueViewers,
        avgViewTime,
        reshareRate: Math.round(reshareRate),
        topDiamonds,
        recentActivity
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No analytics data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diamond Sharing Analytics</h1>
          <p className="text-gray-600 mt-1">Track how your diamonds are shared and viewed</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button onClick={fetchAnalytics} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shares</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalShares}</p>
              </div>
              <Share2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-green-600">{analytics.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Viewers</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.uniqueViewers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg View Time</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.avgViewTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reshare Rate</p>
                <p className="text-2xl font-bold text-pink-600">{analytics.reshareRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Diamonds & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Diamonds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Performing Diamonds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topDiamonds.map((diamond, index) => (
                <div key={diamond.diamond_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">#{diamond.stock_number}</p>
                      <p className="text-sm text-gray-500">ID: {diamond.diamond_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {diamond.shares} shares
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {diamond.views} views
                    </Badge>
                  </div>
                </div>
              ))}
              {analytics.topDiamonds.length === 0 && (
                <p className="text-center text-gray-500 py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'share' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={activity.type === 'share' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.type}
                      </Badge>
                      <span className="font-medium text-sm">#{activity.stock_number}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {analytics.recentActivity.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
