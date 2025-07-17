import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Users, 
  Clock, 
  Smartphone, 
  RefreshCw,
  TrendingUp,
  Share2,
  ArrowUpRight
} from 'lucide-react';

interface ShareAnalytics {
  diamond_stock_number: string;
  total_views: number;
  unique_viewers: number;
  mobile_views: number;
  avg_time_spent: number;
  return_visitors: number;
  viewed_others: number;
  last_viewed: string;
}

export function DiamondShareAnalytics() {
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get aggregated analytics for all diamonds
      const { data, error } = await supabase
        .from('diamond_share_analytics')
        .select(`
          diamond_stock_number,
          viewer_telegram_id,
          device_type,
          time_spent_seconds,
          returned_visitor,
          viewed_other_diamonds,
          view_timestamp
        `);

      if (error) throw error;

      // Aggregate the data
      const aggregated = data.reduce((acc: { [key: string]: any }, row) => {
        const stock = row.diamond_stock_number;
        
        if (!acc[stock]) {
          acc[stock] = {
            diamond_stock_number: stock,
            total_views: 0,
            unique_viewers: new Set(),
            mobile_views: 0,
            time_spent_total: 0,
            time_spent_count: 0,
            return_visitors: 0,
            viewed_others: 0,
            last_viewed: row.view_timestamp
          };
        }

        acc[stock].total_views++;
        acc[stock].unique_viewers.add(row.viewer_telegram_id);
        
        if (row.device_type === 'mobile') {
          acc[stock].mobile_views++;
        }
        
        if (row.time_spent_seconds) {
          acc[stock].time_spent_total += row.time_spent_seconds;
          acc[stock].time_spent_count++;
        }
        
        if (row.returned_visitor) {
          acc[stock].return_visitors++;
        }
        
        if (row.viewed_other_diamonds) {
          acc[stock].viewed_others++;
        }

        if (new Date(row.view_timestamp) > new Date(acc[stock].last_viewed)) {
          acc[stock].last_viewed = row.view_timestamp;
        }

        return acc;
      }, {});

      // Convert to array and calculate percentages
      const analyticsArray = Object.values(aggregated).map((item: any) => ({
        diamond_stock_number: item.diamond_stock_number,
        total_views: item.total_views,
        unique_viewers: item.unique_viewers.size,
        mobile_views: Math.round((item.mobile_views / item.total_views) * 100),
        avg_time_spent: item.time_spent_count > 0 
          ? Math.round(item.time_spent_total / item.time_spent_count) 
          : 0,
        return_visitors: item.return_visitors,
        viewed_others: item.viewed_others,
        last_viewed: item.last_viewed
      }));

      // Sort by total views descending
      analyticsArray.sort((a, b) => b.total_views - a.total_views);

      setAnalytics(analyticsArray);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch diamond analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = (stockNumber: string) => {
    const shareUrl = `https://miniapp.mazalbot.com/secure-diamond/${stockNumber}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share Link Copied!",
      description: `Secure link for diamond ${stockNumber} copied to clipboard`,
    });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngagementColor = (avgTime: number) => {
    if (avgTime >= 60) return 'text-green-600';
    if (avgTime >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Diamond Share Analytics</h2>
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
            <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground">
              Start sharing your diamonds to see analytics data here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.map((item) => (
            <Card key={item.diamond_stock_number} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Diamond {item.diamond_stock_number}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateShareLink(item.diamond_stock_number)}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last viewed {formatDate(item.last_viewed)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-2xl font-bold text-blue-600">
                        {item.total_views}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold text-green-600">
                        {item.unique_viewers}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Unique Viewers</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Mobile Views</span>
                    </div>
                    <Badge variant="secondary">{item.mobile_views}%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Avg Time</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getEngagementColor(item.avg_time_spent)}
                    >
                      {item.avg_time_spent}s
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm">Return Visits</span>
                    </div>
                    <Badge variant="secondary">{item.return_visitors}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-teal-500" />
                      <span className="text-sm">Explored More</span>
                    </div>
                    <Badge variant="secondary">{item.viewed_others}</Badge>
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