import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Share2, MessageCircle, TrendingUp, Users, Target } from 'lucide-react';

interface LeadGenerationAnalyticsProps {
  shareAnalytics?: Array<{
    diamond_stock_number: string;
    view_timestamp: string;
    time_spent_seconds?: number;
    viewer_telegram_id?: number;
    viewed_other_diamonds?: boolean;
  }>;
  totalDiamonds: number;
}

interface LeadInsights {
  totalViews: number;
  uniqueViewers: number;
  averageViewTime: number;
  conversionRate: number;
  hotLeads: number;
  sharePerformance: Array<{
    stockNumber: string;
    views: number;
    uniqueViewers: number;
    avgViewTime: number;
    leadScore: number;
  }>;
  viewerBehavior: {
    returningViewers: number;
    deepViewers: number; // Viewed multiple diamonds
    quickBounce: number; // < 30 seconds
  };
}

export function LeadGenerationAnalytics({ shareAnalytics = [], totalDiamonds }: LeadGenerationAnalyticsProps) {
  const insights = useMemo((): LeadInsights => {
    if (!shareAnalytics || shareAnalytics.length === 0) {
      return {
        totalViews: 0,
        uniqueViewers: 0,
        averageViewTime: 0,
        conversionRate: 0,
        hotLeads: 0,
        sharePerformance: [],
        viewerBehavior: {
          returningViewers: 0,
          deepViewers: 0,
          quickBounce: 0,
        }
      };
    }

    const totalViews = shareAnalytics.length;
    const uniqueViewers = new Set(shareAnalytics.map(s => s.viewer_telegram_id).filter(id => id)).size;
    
    // Calculate average view time
    const viewsWithTime = shareAnalytics.filter(s => s.time_spent_seconds && s.time_spent_seconds > 0);
    const averageViewTime = viewsWithTime.length > 0 
      ? viewsWithTime.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / viewsWithTime.length
      : 0;

    // Group by diamond for performance analysis
    const diamondViews = shareAnalytics.reduce((acc, view) => {
      const stockNumber = view.diamond_stock_number;
      if (!acc[stockNumber]) {
        acc[stockNumber] = [];
      }
      acc[stockNumber].push(view);
      return acc;
    }, {} as Record<string, typeof shareAnalytics>);

    const sharePerformance = Object.entries(diamondViews)
      .map(([stockNumber, views]) => {
        const uniqueViewers = new Set(views.map(v => v.viewer_telegram_id).filter(id => id)).size;
        const totalViewTime = views.reduce((sum, v) => sum + (v.time_spent_seconds || 0), 0);
        const avgViewTime = views.length > 0 ? totalViewTime / views.length : 0;
        
        // Calculate lead score based on engagement metrics
        let leadScore = 0;
        leadScore += Math.min(views.length * 10, 50); // Views (max 50 points)
        leadScore += Math.min(uniqueViewers * 15, 30); // Unique viewers (max 30 points)
        leadScore += Math.min(avgViewTime / 10, 20); // View time (max 20 points)
        
        return {
          stockNumber,
          views: views.length,
          uniqueViewers,
          avgViewTime,
          leadScore: Math.min(leadScore, 100)
        };
      })
      .sort((a, b) => b.leadScore - a.leadScore)
      .slice(0, 10);

    // Analyze viewer behavior
    const viewerStats = shareAnalytics.reduce((acc, view) => {
      if (view.viewer_telegram_id) {
        if (!acc[view.viewer_telegram_id]) {
          acc[view.viewer_telegram_id] = {
            views: 0,
            totalTime: 0,
            viewedMultiple: false
          };
        }
        acc[view.viewer_telegram_id].views++;
        acc[view.viewer_telegram_id].totalTime += view.time_spent_seconds || 0;
        if (view.viewed_other_diamonds) {
          acc[view.viewer_telegram_id].viewedMultiple = true;
        }
      }
      return acc;
    }, {} as Record<number, { views: number, totalTime: number, viewedMultiple: boolean }>);

    const returningViewers = Object.values(viewerStats).filter(v => v.views > 1).length;
    const deepViewers = Object.values(viewerStats).filter(v => v.viewedMultiple).length;
    const quickBounce = shareAnalytics.filter(s => (s.time_spent_seconds || 0) < 30).length;

    // Hot leads: viewers with high engagement
    const hotLeads = Object.values(viewerStats).filter(v => 
      v.views > 2 || v.totalTime > 300 || v.viewedMultiple
    ).length;

    // Conversion rate: percentage of viewers who are considered hot leads
    const conversionRate = uniqueViewers > 0 ? (hotLeads / uniqueViewers) * 100 : 0;

    return {
      totalViews,
      uniqueViewers,
      averageViewTime,
      conversionRate,
      hotLeads,
      sharePerformance,
      viewerBehavior: {
        returningViewers,
        deepViewers,
        quickBounce,
      }
    };
  }, [shareAnalytics]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Lead Generation KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Across {totalDiamonds} diamonds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{insights.uniqueViewers}</div>
            <p className="text-xs text-muted-foreground">
              Potential customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{insights.hotLeads}</div>
            <p className="text-xs text-muted-foreground">
              High engagement viewers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{insights.conversionRate.toFixed(1)}%</div>
            <Progress value={insights.conversionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Views to leads ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Viewer Behavior Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Viewer Behavior Analysis</CardTitle>
          <CardDescription>Understanding how potential customers interact with your diamonds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{insights.viewerBehavior.returningViewers}</div>
              <p className="text-sm font-medium">Returning Viewers</p>
              <p className="text-xs text-muted-foreground">Came back multiple times</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{insights.viewerBehavior.deepViewers}</div>
              <p className="text-sm font-medium">Deep Browsers</p>
              <p className="text-xs text-muted-foreground">Viewed multiple diamonds</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{insights.viewerBehavior.quickBounce}</div>
              <p className="text-sm font-medium">Quick Bounces</p>
              <p className="text-xs text-muted-foreground">Left within 30 seconds</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm">
              <strong>Average View Time:</strong> {formatTime(insights.averageViewTime)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Industry benchmark: 2-3 minutes indicates strong interest
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Diamonds */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Diamonds</CardTitle>
          <CardDescription>Your diamonds ranked by lead generation potential</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.sharePerformance.length > 0 ? (
            <div className="space-y-3">
              {insights.sharePerformance.slice(0, 5).map((diamond, index) => (
                <div key={diamond.stockNumber} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">Stock #{diamond.stockNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {diamond.views} views • {diamond.uniqueViewers} unique viewers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Avg View Time</p>
                      <p className="font-medium">{formatTime(diamond.avgViewTime)}</p>
                    </div>
                    <Badge className={getLeadScoreColor(diamond.leadScore)}>
                      {Math.round(diamond.leadScore)} Lead Score
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium">No Sharing Data Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start sharing your diamonds to track lead generation performance
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Lead Generation Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Follow up with hot leads</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {insights.hotLeads} viewers showed high engagement - reach out with personalized offers
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Promote top performers</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your top diamonds are generating interest - increase their visibility in groups
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <Eye className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">Optimize quick bounces</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {insights.viewerBehavior.quickBounce} quick exits - improve diamond descriptions and images
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}