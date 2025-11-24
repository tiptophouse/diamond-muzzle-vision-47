import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAuctionById, placeBid } from '@/lib/auctions';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { formatDistance } from 'date-fns';
import { Clock, Gavel, TrendingUp, Share2, Eye, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeAuctionViews } from '@/hooks/useRealtimeAuctionViews';
import { useRealtimeAuctionBids } from '@/hooks/useRealtimeAuctionBids';
import { useAuctionViralMechanics } from '@/hooks/useAuctionViralMechanics';
import { supabase } from '@/integrations/supabase/client';

export default function PublicAuctionPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [searchParams] = useSearchParams();
  const isShared = searchParams.get('shared') === 'true';
  const groupId = searchParams.get('group');
  const sharerId = searchParams.get('sharer');
  const trackingId = searchParams.get('track');
  const { webApp, hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState('');
  const { viewCount, uniqueViewers } = useRealtimeAuctionViews(auctionId || '');
  const { bids: realtimeBids, currentPrice: realtimePrice, bidCount: realtimeBidCount, lastBidTime } = useRealtimeAuctionBids(auctionId || '');
  const { checkBidWarMode } = useAuctionViralMechanics();

  // Fetch auction details
  const { data: auction, isLoading, refetch } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      if (!auctionId) throw new Error('No auction ID');
      return await getAuctionById(auctionId);
    },
    enabled: !!auctionId,
    refetchInterval: 30000, // Refresh every 30s
  });

  // Update time remaining
  useEffect(() => {
    if (!auction) return;
    
    const updateTime = () => {
      const now = new Date();
      const end = new Date((auction as any).ends_at);
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('המכרז הסתיים');
        refetch();
      } else {
        setTimeRemaining(formatDistance(end, now, { addSuffix: true }));
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [auction, refetch]);

  // Track view when page loads
  useEffect(() => {
    if (!auctionId || !user) return;

    const trackView = async () => {
      try {
        const { error } = await supabase.functions.invoke('track-auction-view', {
          body: {
            auction_id: auctionId,
            viewer_id: user.id,
            source_group_id: groupId,
            sharer_id: sharerId ? parseInt(sharerId) : null,
            tracking_id: trackingId || `direct_${Date.now()}`,
          },
        });
        
        if (error) {
          console.error('Failed to track view:', error);
          toast({ title: 'שגיאה', description: 'לא ניתן לעקוב אחר צפייה', variant: 'destructive' });
        } else {
          console.log('✅ Auction view tracked');
        }
      } catch (error) {
        console.error('Failed to track view:', error);
        toast({ title: 'שגיאה', description: 'לא ניתן לעקוב אחר צפייה', variant: 'destructive' });
      }
    };

    trackView();
  }, [auctionId, user, groupId, sharerId, trackingId, toast]);

  const handlePlaceBid = async () => {
    if (!auction || !user) {
      toast({ title: 'שגיאה', description: 'יש להתחבר כדי להציע הצעה', variant: 'destructive' });
      return;
    }
    
    hapticFeedback.impact('medium');
    
    try {
      await placeBid(auction.id);
      hapticFeedback.notification('success');
      toast({ title: '✅ ההצעה נרשמה בהצלחה!' });
      refetch();

      // Check for bid war mode activation
      const bidWarResult = await checkBidWarMode(auction.id);
      if (bidWarResult.extended) {
        console.log('🔥 Bid war mode activated, auction extended!');
      }
    } catch (error) {
      console.error('Failed to place bid:', error);
      hapticFeedback.notification('error');
      toast({ title: 'שגיאה', description: 'לא ניתן להציע הצעה כרגע', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    const botUsername = 'Brilliantteatbot';
    const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sharerId = user?.id || 0;
    const deepLink = `https://t.me/${botUsername}?startapp=auction_${auctionId}_sharer${sharerId}_track${trackingId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `מכרז: ${(auction as any)?.stock_number || (auction as any)?.diamond?.stock_number}`,
        text: `💎 מכרז יהלום - מחיר נוכחי: $${(auction as any)?.current_price}\n👀 ${viewCount} צפיות | 👥 ${uniqueViewers} צופים ייחודיים`,
        url: deepLink,
      });
    } else {
      navigator.clipboard.writeText(deepLink);
      hapticFeedback.notification('success');
      toast({ title: '✅ הקישור הועתק ללוח' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">טוען...</div>;
  }

  if (!auction) {
    return <div className="flex items-center justify-center min-h-screen">מכרז לא נמצא</div>;
  }

  const isSeller = user?.id === (auction as any).seller_telegram_id;
  const isActive = (auction as any).status === 'active';
  
  // Use realtime price if available, otherwise fall back to auction data
  const displayPrice = realtimePrice || (auction as any).current_price;
  const displayBidCount = realtimeBidCount || (auction as any).bid_count;
  const nextBidAmount = displayPrice + (auction as any).min_increment;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔨 מכרז</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Eye className="h-3 w-3" />
              {viewCount}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {uniqueViewers}
            </Badge>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {(auction as any).status === 'active' ? 'פעיל' : 'הסתיים'}
            </Badge>
          </div>
        </div>

        {/* Attribution Badge */}
        {sharerId && (
          <Badge variant="secondary" className="w-fit">
            שותף על ידי משתמש #{sharerId}
          </Badge>
        )}

        {/* Diamond Info */}
        {(auction as any).diamond && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{(auction as any).diamond.stock_number || (auction as any).stock_number}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>צורה: {(auction as any).diamond.shape}</div>
              <div>משקל: {(auction as any).diamond.weight} ct</div>
              <div>צבע: {(auction as any).diamond.color}</div>
              <div>ניקיון: {(auction as any).diamond.clarity}</div>
            </div>
          </div>
        )}
        {!(auction as any).diamond && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{(auction as any).stock_number}</h2>
          </div>
        )}

        {/* Current Price - REAL-TIME UPDATE */}
        <div className="bg-primary/10 rounded-lg p-4 relative">
          {lastBidTime && (
            <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] animate-pulse">
              🔴 LIVE
            </Badge>
          )}
          <div className="text-sm text-muted-foreground">מחיר נוכחי</div>
          <div className="text-3xl font-bold animate-in fade-in duration-300">${displayPrice}</div>
          {isActive && (
            <div className="text-sm text-muted-foreground mt-1">
              הצעה הבאה: ${nextBidAmount}
            </div>
          )}
          {lastBidTime && (
            <div className="text-[10px] text-muted-foreground mt-1">
              עודכן לפני {Math.floor((Date.now() - lastBidTime.getTime()) / 1000)}s
            </div>
          )}
        </div>

        {/* Time Remaining */}
        {isActive && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
        )}

        {/* Bid Stats - REAL-TIME */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold animate-in fade-in duration-300">{displayBidCount}</div>
            <div className="text-xs text-muted-foreground">הצעות</div>
          </div>
          <div>
            <div className="text-2xl font-bold">${(auction as any).starting_price}</div>
            <div className="text-xs text-muted-foreground">מחיר התחלתי</div>
          </div>
          <div>
            <div className="text-2xl font-bold">${(auction as any).min_increment}</div>
            <div className="text-xs text-muted-foreground">הפרש מינימלי</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {isActive && !isSeller && user && (
            <Button onClick={handlePlaceBid} className="w-full" size="lg">
              <Gavel className="w-4 h-4 mr-2" />
              הצע ${nextBidAmount}
            </Button>
          )}
          
          {isSeller && (
            <Badge variant="outline" className="w-full justify-center py-2">
              זהו המכרז שלך
            </Badge>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              שתף
            </Button>
            <Button variant="outline" onClick={() => window.open(`/diamond/${(auction as any).stock_number}`, '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              צפה ביהלום
            </Button>
          </div>
        </div>

        {/* Latest Bids - REAL-TIME */}
        {realtimeBids && realtimeBids.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              הצעות אחרונות (עדכון אוטומטי)
            </h3>
            <div className="space-y-1">
              {realtimeBids.slice(0, 5).map((bid, index) => (
                <div 
                  key={bid.id} 
                  className={`flex justify-between items-center text-sm p-2 bg-muted rounded animate-in slide-in-from-top duration-300`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span>{bid.bidder_name || 'משתמש'}</span>
                  <span className="font-semibold">${bid.bid_amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
