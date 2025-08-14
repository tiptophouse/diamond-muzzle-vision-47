
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Eye, 
  Users, 
  Clock, 
  TrendingUp,
  MessageCircle,
  Calendar,
  Target,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';

interface ShareAnalytics {
  diamondId: string;
  stockNumber: string;
  totalShares: number;
  totalViews: number;
  uniqueViewers: number;
  avgViewTime: number;
  lastShared: string;
  conversionRate: number;
  recentActivity: Array<{
    type: 'share' | 'view' | 'contact';
    timestamp: string;
    details: string;
    viewerInfo?: {
      telegramId?: number;
      firstName?: string;
      deviceType?: string;
    };
  }>;
}

interface RecipientBehavior {
  viewerId: string;
  firstName?: string;
  totalViews: number;
  totalViewTime: number;
  lastViewed: string;
  averageSessionTime: number;
  returnVisits: number;
  interactions: string[];
  hasContacted: boolean;
}

export function UserSharingAnalytics() {
  const { user } = useTelegramAuth();
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([]);
  const [recipients, setRecipients] = useState<RecipientBehavior[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchSharingAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const timeAgo = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      timeAgo.setDate(timeAgo.getDate() - days);

      // Get shares by current user
      const { data: shares, error: sharesError } = await supabase
        .from('diamond_shares')
        .select(`
          *,
          diamond_views!diamond_views_diamond_id_fkey (
            id,
            viewer_telegram_id,
            total_view_time,
            view_start,
            interactions,
            reshared
          )
        `)
        .eq('shared_by', user.id)
        .gte('created_at', timeAgo.toISOString());

      if (sharesError) throw sharesError;

      // Process analytics data
      const analyticsData: ShareAnalytics[] = [];
      const recipientData = new Map<string, RecipientBehavior>();

      shares?.forEach(share => {
        const views = Array.isArray(share.diamond_views) ? share.diamond_views : [];
        const uniqueViewers = new Set(views.map(v => v.viewer_telegram_id).filter(Boolean)).size;
        const totalViewTime = views.reduce((sum, v) => sum + (v.total_view_time || 0), 0);
        const avgViewTime = views.length > 0 ? Math.round(totalViewTime / views.length) : 0;

        // Calculate conversion rate (views that led to interactions)
        const interactiveViews = views.filter(v => 
          Array.isArray(v.interactions) ? v.interactions.length > 0 : false
        ).length;
        const conversionRate = views.length > 0 ? Math.round((interactiveViews / views.length) * 100) : 0;

        analyticsData.push({
          diamondId: share.diamond_id,
          stockNumber: share.stock_number,
          totalShares: 1, // Each record is one share
          totalViews: views.length,
          uniqueViewers,
          avgViewTime,
          lastShared: share.created_at,
          conversionRate,
          recentActivity: views.map(view => ({
            type: 'view' as const,
            timestamp: view.view_start,
            details: `Viewed for ${Math.round(view.total_view_time || 0)}s`,
            viewerInfo: {
              telegramId: view.viewer_telegram_id,
              deviceType: 'mobile' // Would come from view data
            }
          }))
        });

        // Process recipient behavior
        views.forEach(view => {
          if (!view.viewer_telegram_id) return;
          
          const viewerId = view.viewer_telegram_id.toString();
          const existing = recipientData.get(viewerId);
          
          if (existing) {
            existing.totalViews++;
            existing.totalViewTime += view.total_view_time || 0;
            existing.lastViewed = view.view_start;
            existing.returnVisits++;
          } else {
            recipientData.set(viewerId, {
              viewerId,
              totalViews: 1,
              totalViewTime: view.total_view_time || 0,
              lastViewed: view.view_start,
              averageSessionTime: view.total_view_time || 0,
              returnVisits: 0,
              interactions: Array.isArray(view.interactions) ? view.interactions : [],
              hasContacted: false
            });
          }
        });
      });

      // Calculate average session times
      recipientData.forEach(recipient => {
        recipient.averageSessionTime = recipient.totalViews > 0 
          ? Math.round(recipient.totalViewTime / recipient.totalViews) 
          : 0;
      });

      setAnalytics(analyticsData);
      setRecipients(Array.from(recipientData.values()));
      
    } catch (error) {
      console.error('Failed to fetch sharing analytics:', error);
      toast.error('Failed to load sharing analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharingAnalytics();
  }, [user, timeRange]);

  const totalStats = analytics.reduce((acc, item) => ({
    shares: acc.shares + item.totalShares,
    views: acc.views + item.totalViews,
    viewers: acc.viewers + item.uniqueViewers,
    avgTime: acc.avgTime + item.avgViewTime
  }), { shares: 0, views: 0, viewers: 0, avgTime: 0 });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Sharing Analytics</h2>
          <p className="text-gray-600 mt-1">Track how recipients interact with your shared diamonds</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
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
          <Button onClick={fetchSharingAnalytics} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shares</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.shares}</p>
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
                <p className="text-2xl font-bold text-green-600">{totalStats.views}</p>
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
                <p className="text-2xl font-bold text-purple-600">{totalStats.viewers}</p>
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
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(totalStats.avgTime / Math.max(analytics.length, 1))}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="diamonds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diamonds">Diamond Performance</TabsTrigger>
          <TabsTrigger value="recipients">Recipient Behavior</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diamonds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Diamond Sharing Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((item, index) => (
                  <div key={item.diamondId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">#{item.stockNumber}</p>
                        <p className="text-sm text-gray-500">Last shared: {new Date(item.lastShared).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.totalViews} views
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.uniqueViewers} viewers
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.conversionRate}% engagement
                      </Badge>
                    </div>
                  </div>
                ))}
                {analytics.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No sharing data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recipient Behavior Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipients.map((recipient, index) => (
                  <div key={recipient.viewerId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {recipient.firstName ? recipient.firstName[0] : 'U'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {recipient.firstName || `User ${recipient.viewerId}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Last viewed: {new Date(recipient.lastViewed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {recipient.hasContacted && (
                        <Badge className="bg-green-100 text-green-800">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contacted
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{recipient.totalViews}</p>
                        <p className="text-gray-500">Total Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{recipient.averageSessionTime}s</p>
                        <p className="text-gray-500">Avg Session</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-purple-600">{recipient.returnVisits}</p>
                        <p className="text-gray-500">Return Visits</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-orange-600">{recipient.interactions.length}</p>
                        <p className="text-gray-500">Interactions</p>
                      </div>
                    </div>
                  </div>
                ))}
                {recipients.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No recipient data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
