import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, MousePointer, Gavel, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { format } from 'date-fns';

export default function AuctionPerformance() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const { hapticFeedback, backButton } = useTelegramWebApp();

  backButton.show();
  backButton.onClick(() => navigate(-1));

  const { data: stats, isLoading } = useQuery({
    queryKey: ['auction-performance', auctionId],
    queryFn: async () => {
      // Get auction data
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();
      
      if (auctionError) throw auctionError;
      
      // Get analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('auction_analytics')
        .select('*')
        .eq('auction_id', auctionId);
      
      if (analyticsError) throw analyticsError;
      
      // Get bids
      const { data: bids, error: bidsError } = await supabase
        .from('auction_bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false });
      
      if (bidsError) throw bidsError;
      
      // Calculate stats
      const views = analytics?.filter(a => a.event_type === 'view').length || 0;
      const clicks = analytics?.filter(a => a.event_type === 'click').length || 0;
      const bidAttempts = analytics?.filter(a => a.event_type === 'bid_attempt').length || 0;
      const successfulBids = analytics?.filter(a => a.event_type === 'bid_success').length || 0;
      
      const uniqueBidders = new Set(
        analytics?.filter(a => a.event_type === 'bid_success').map(a => a.telegram_id)
      ).size;
      
      const conversionRate = clicks > 0 ? (successfulBids / clicks * 100).toFixed(1) : '0';
      
      return {
        auction,
        total_views: auction?.total_views || views,
        total_clicks: auction?.total_clicks || clicks,
        total_bids: auction?.bid_count || bids?.length || 0,
        unique_bidders: uniqueBidders,
        current_price: auction?.current_price,
        starting_price: auction?.starting_price,
        reserve_price: auction?.reserve_price,
        conversion_rate: conversionRate,
        bid_attempts: bidAttempts,
        latest_bids: bids?.slice(0, 5) || [],
        status: auction?.status,
        ends_at: auction?.ends_at
      };
    },
    enabled: !!auctionId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">מכרז לא נמצא</p>
          <Button onClick={() => navigate(-1)}>חזור</Button>
        </div>
      </div>
    );
  }

  const priceIncrease = stats.current_price - stats.starting_price;
  const priceIncreasePercent = ((priceIncrease / stats.starting_price) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">📊 ביצועי מכרז</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {stats.status === 'active' ? (
            <span>פעיל עד {format(new Date(stats.ends_at), 'dd/MM/yyyy HH:mm')}</span>
          ) : (
            <span className="text-orange-500 font-semibold">הסתיים</span>
          )}
        </div>
      </div>

      {/* Price Stats */}
      <Card className="mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ביצועי מחיר
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">מחיר התחלתי</span>
            <span className="font-bold">${stats.starting_price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">מחיר נוכחי</span>
            <span className="text-2xl font-bold text-primary">${stats.current_price}</span>
          </div>
          {stats.reserve_price && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">מחיר מינימום</span>
              <span className="font-semibold">${stats.reserve_price}</span>
            </div>
          )}
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">עליה במחיר</span>
              <span className="font-bold text-green-600">
                +${priceIncrease} ({priceIncreasePercent}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <Eye className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-3xl font-bold">{stats.total_views}</p>
            <p className="text-sm text-muted-foreground">צפיות</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <MousePointer className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-3xl font-bold">{stats.total_clicks}</p>
            <p className="text-sm text-muted-foreground">קליקים</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <Gavel className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-3xl font-bold">{stats.total_bids}</p>
            <p className="text-sm text-muted-foreground">הצעות</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-3xl font-bold">{stats.unique_bidders}</p>
            <p className="text-sm text-muted-foreground">משתתפים</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">שיעור המרה</span>
            <span className="text-2xl font-bold">{stats.conversion_rate}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.total_bids} הצעות מתוך {stats.total_clicks} קליקים
          </p>
        </CardContent>
      </Card>

      {/* Latest Bids */}
      {stats.latest_bids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>הצעות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.latest_bids.map((bid: any, index: number) => (
                <div 
                  key={bid.id} 
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                  onClick={() => hapticFeedback.impact('light')}
                >
                  <div>
                    <p className="font-semibold">{bid.bidder_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bid.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">${bid.bid_amount}</p>
                    {index === 0 && stats.status === 'active' && (
                      <p className="text-xs text-green-600 font-semibold">הצעה מובילה</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Auction Button */}
      <div className="fixed bottom-4 left-4 right-4">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => {
            hapticFeedback.impact('medium');
            navigate(`/auction/${auctionId}`);
          }}
        >
          צפה במכרז
          <ArrowRight className="w-4 h-4 mr-2" />
        </Button>
      </div>
    </div>
  );
}