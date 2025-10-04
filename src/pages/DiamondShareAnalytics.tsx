/**
 * Diamond Share Analytics Dashboard
 * Track performance of shared diamonds (limit 5 active shares)
 * Shows clicks, views, time spent, and engagement metrics
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {  
  Eye, 
  Clock, 
  Users, 
  TrendingUp,
  Share2,
  ArrowLeft,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareAnalytics {
  stock_number: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  price: number;
  imageUrl: string;
  total_views: number;
  unique_viewers: number;
  avg_time_spent: number;
  last_viewed: string;
  share_date: string;
  reshares: number;
}

export default function DiamondShareAnalytics() {
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLimit] = useState(5);

  useEffect(() => {
    if (!user?.id) {
      toast.error('Please log in to view analytics');
      navigate('/');
      return;
    }

    fetchShareAnalytics();
  }, [user?.id, navigate]);

  const fetchShareAnalytics = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Set session context
      await supabase.rpc('set_session_context', {
        key: 'app.current_user_id',
        value: user.id.toString()
      });

      // For now, just get diamonds that have views (analytics)
      // In future, can track specific "shared" diamonds
      const { data: viewedDiamonds, error: viewsError } = await supabase
        .from('diamond_views')
        .select('diamond_id')
        .limit(100);

      if (viewsError) throw viewsError;

      if (!viewedDiamonds || viewedDiamonds.length === 0) {
        setAnalytics([]);
        setLoading(false);
        return;
      }

      // Get unique stock numbers
      const uniqueStockNumbers = [...new Set(viewedDiamonds.map(v => v.diamond_id))].slice(0, shareLimit);

      // Fetch diamond details and detailed analytics
      const analyticsPromises = uniqueStockNumbers.map(async (stockNumber) => {
        // Get diamond details
        const { data: diamond } = await supabase
          .from('inventory')
          .select('stock_number, shape, weight, color, clarity, price_per_carat, picture')
          .eq('stock_number', stockNumber)
          .eq('store_visible', true)
          .single();

        if (!diamond) return null;

        // Get detailed analytics for this diamond
        const { data: views } = await supabase
          .from('diamond_views')
          .select('viewer_telegram_id, total_view_time, view_start')
          .eq('diamond_id', stockNumber);

        const uniqueViewers = new Set(views?.map(v => v.viewer_telegram_id).filter(Boolean)).size;
        const totalViewTime = views?.reduce((sum, v) => sum + (v.total_view_time || 0), 0) || 0;
        const avgTimeSpent = views && views.length > 0 ? totalViewTime / views.length : 0;
        const lastView = views && views.length > 0 
          ? views[views.length - 1].view_start 
          : new Date().toISOString();
        const shareDate = views && views.length > 0 
          ? views[0].view_start 
          : new Date().toISOString();

        return {
          stock_number: diamond.stock_number,
          shape: diamond.shape,
          carat: diamond.weight,
          color: diamond.color,
          clarity: diamond.clarity,
          price: Math.round((diamond.price_per_carat || 0) * diamond.weight),
          imageUrl: diamond.picture || '',
          total_views: views?.length || 0,
          unique_viewers: uniqueViewers,
          avg_time_spent: Math.round(avgTimeSpent),
          last_viewed: lastView,
          share_date: shareDate,
          reshares: 0 // Would need to implement reshare tracking
        };
      });

      const analyticsData = (await Promise.all(analyticsPromises)).filter(Boolean) as ShareAnalytics[];
      setAnalytics(analyticsData.sort((a, b) => b.total_views - a.total_views));

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Share Analytics</h1>
            </div>

            <Badge variant="secondary" className="px-3 py-1">
              {analytics.length} / {shareLimit}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, a) => sum + a.total_views, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, a) => sum + a.unique_viewers, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Unique Viewers</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">
                  {formatDuration(
                    Math.round(
                      analytics.reduce((sum, a) => sum + a.avg_time_spent, 0) / 
                      (analytics.length || 1)
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Share2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">
                  {analytics.reduce((sum, a) => sum + a.reshares, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Re-shares</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Diamond Analytics */}
        {analytics.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Active Shares</h3>
            <p className="text-muted-foreground mb-6">
              Share diamonds to groups to start tracking analytics
            </p>
            <Button onClick={() => navigate('/store')}>
              Go to Store
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {analytics.map((item) => (
              <Card key={item.stock_number} className="overflow-hidden">
                <div className="grid md:grid-cols-[200px_1fr] gap-0">
                  {/* Diamond Image */}
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-square md:aspect-auto">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={`${item.carat}ct ${item.shape}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Analytics Details */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.carat}ct {item.shape}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.color} • {item.clarity} • ${item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Stock #{item.stock_number}
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/diamond/${item.stock_number}`)}
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Views</span>
                        </div>
                        <p className="text-2xl font-bold">{item.total_views}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.unique_viewers} unique
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Avg Time</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {formatDuration(item.avg_time_spent)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Share2 className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Re-shares</span>
                        </div>
                        <p className="text-2xl font-bold">{item.reshares}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Last View</span>
                        </div>
                        <p className="text-sm font-bold">
                          {formatTimeAgo(item.last_viewed)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Shared {formatTimeAgo(item.share_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Share Limit Info */}
        {analytics.length >= shareLimit && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-blue-700">
                📊 You've reached your share limit ({shareLimit} diamonds).
                Deactivate shares to track new diamonds.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
