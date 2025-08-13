
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Eye, 
  Clock, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Smartphone,
  Monitor
} from 'lucide-react';

interface ShareAnalytics {
  diamond_id: string;
  stock_number: string;
  total_shares: number;
  total_views: number;
  unique_viewers: number;
  avg_view_time: number;
  total_interactions: number;
  reshare_rate: number;
  mobile_views: number;
  desktop_views: number;
  last_shared: string;
  last_viewed: string;
}

export function DiamondSharingAnalytics() {
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get sharing and viewing data
      const { data: sharesData, error: sharesError } = await supabase
        .from('diamond_shares')
        .select('diamond_id, stock_number, created_at');

      const { data: viewsData, error: viewsError } = await supabase
        .from('diamond_views')
        .select(`
          diamond_id,
          session_id,
          viewer_telegram_id,
          total_view_time,
          interactions,
          reshared,
          device_type,
          view_start,
          last_interaction
        `);

      if (sharesError || viewsError) {
        throw sharesError || viewsError;
      }

      // Aggregate analytics by diamond
      const analyticsMap = new Map<string, any>();

      // Process shares data
      sharesData?.forEach(share => {
        const key = share.diamond_id;
        if (!analyticsMap.has(key)) {
          analyticsMap.set(key, {
            diamond_id: share.diamond_id,
            stock_number: share.stock_number,
            total_shares: 0,
            total_views: 0,
            unique_viewers: new Set(),
            total_view_time: 0,
            total_interactions: 0,
            reshares: 0,
            mobile_views: 0,
            desktop_views: 0,
            last_shared: share.created_at,
            last_viewed: null
          });
        }
        
        const item = analyticsMap.get(key);
        item.total_shares++;
        if (new Date(share.created_at) > new Date(item.last_shared)) {
          item.last_shared = share.created_at;
        }
      });

      // Process views data
      viewsData?.forEach(view => {
        const key = view.diamond_id;
        if (!analyticsMap.has(key)) {
          analyticsMap.set(key, {
            diamond_id: view.diamond_id,
            stock_number: view.diamond_id, // Fallback
            total_shares: 0,
            total_views: 0,
            unique_viewers: new Set(),
            total_view_time: 0,
            total_interactions: 0,
            reshares: 0,
            mobile_views: 0,
            desktop_views: 0,
            last_shared: null,
            last_viewed: view.view_start
          });
        }

        const item = analyticsMap.get(key);
        item.total_views++;
        item.unique_viewers.add(view.viewer_telegram_id || view.session_id);
        item.total_view_time += view.total_view_time || 0;
        item.total_interactions += view.interactions?.length || 0;
        
        if (view.reshared) item.reshares++;
        if (view.device_type === 'mobile') item.mobile_views++;
        else item.desktop_views++;

        if (view.last_interaction && (!item.last_viewed || new Date(view.last_interaction) > new Date(item.last_viewed))) {
          item.last_viewed = view.last_interaction;
        }
      });

      // Convert to final format
      const analyticsArray: ShareAnalytics[] = Array.from(analyticsMap.values()).map(item => ({
        diamond_id: item.diamond_id,
        stock_number: item.stock_number,
        total_shares: item.total_shares,
        total_views: item.total_views,
        unique_viewers: item.unique_viewers.size,
        avg_view_time: item.total_views > 0 ? Math.round(item.total_view_time / item.total_views / 1000) : 0,
        total_interactions: item.total_interactions,
        reshare_rate: item.total_views > 0 ? Math.round((item.reshares / item.total_views) * 100) : 0,
        mobile_views: item.mobile_views,
        desktop_views: item.desktop_views,
        last_shared: item.last_shared,
        last_viewed: item.last_viewed
      }));

      // Sort by total engagement (views + shares)
      analyticsArray.sort((a, b) => (b.total_views + b.total_shares) - (a.total_views + a.total_shares));

      setAnalytics(analyticsArray);
    } catch (error) {
      console.error('Error fetching sharing analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sharing analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngagementColor = (score: number) => {
    if (score >= 100) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Diamond Sharing Analytics</h2>
        <Button onClick={fetchAnalytics} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Share2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sharing Data</h3>
            <p className="text-muted-foreground">
              Start sharing your diamonds to see analytics data here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.map((item) => (
            <Card key={item.diamond_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Diamond {item.stock_number}
                  </CardTitle>
                  <Badge variant="secondary">
                    {item.total_shares + item.total_views} total
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last activity: {formatDate(item.last_viewed || item.last_shared)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Share2 className="h-4 w-4 text-blue-500" />
                      <span className="text-2xl font-bold text-blue-600">
                        {item.total_shares}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Shares</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold text-green-600">
                        {item.total_views}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Unique Viewers</span>
                    </div>
                    <Badge variant="secondary">{item.unique_viewers}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Avg View Time</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getEngagementColor(item.avg_view_time)}
                    >
                      {item.avg_view_time}s
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm">Interactions</span>
                    </div>
                    <Badge variant="secondary">{item.total_interactions}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-pink-500" />
                      <span className="text-sm">Reshare Rate</span>
                    </div>
                    <Badge variant="secondary">{item.reshare_rate}%</Badge>
                  </div>
                </div>

                {/* Device Split */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      {item.mobile_views} mobile
                    </div>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      {item.desktop_views} desktop
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
