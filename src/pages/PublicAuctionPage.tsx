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
import { Clock, Gavel, TrendingUp, Share2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PublicAuctionPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [searchParams] = useSearchParams();
  const isShared = searchParams.get('shared') === 'true';
  const { webApp, hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState('');

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
      const end = new Date(auction.ends_at);
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
    } catch (error) {
      console.error('Failed to place bid:', error);
      hapticFeedback.notification('error');
      toast({ title: 'שגיאה', description: 'לא ניתן להציע הצעה כרגע', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    const botUsername = 'Brilliantteatbot';
    const deepLink = `https://t.me/${botUsername}?startapp=auction_${auctionId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `מכרז: ${auction?.stock_number || auction?.diamond?.stock_number}`,
        text: `💎 מכרז יהלום - מחיר נוכחי: $${auction?.current_price}`,
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

  const isSeller = user?.id === auction.seller_telegram_id;
  const isActive = auction.status === 'active';
  const nextBidAmount = auction.current_price + auction.min_increment;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔨 מכרז</h1>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {auction.status === 'active' ? 'פעיל' : 'הסתיים'}
          </Badge>
        </div>

        {/* Diamond Info */}
        {auction.diamond && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{auction.diamond.stock_number || auction.stock_number}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>צורה: {auction.diamond.shape}</div>
              <div>משקל: {auction.diamond.weight} ct</div>
              <div>צבע: {auction.diamond.color}</div>
              <div>ניקיון: {auction.diamond.clarity}</div>
            </div>
          </div>
        )}
        {!auction.diamond && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{auction.stock_number}</h2>
          </div>
        )}

        {/* Current Price */}
        <div className="bg-primary/10 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">מחיר נוכחי</div>
          <div className="text-3xl font-bold">${auction.current_price}</div>
          {isActive && (
            <div className="text-sm text-muted-foreground mt-1">
              הצעה הבאה: ${nextBidAmount}
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

        {/* Bid Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{auction.bid_count}</div>
            <div className="text-xs text-muted-foreground">הצעות</div>
          </div>
          <div>
            <div className="text-2xl font-bold">${auction.starting_price}</div>
            <div className="text-xs text-muted-foreground">מחיר התחלתי</div>
          </div>
          <div>
            <div className="text-2xl font-bold">${auction.min_increment}</div>
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
            <Button variant="outline" onClick={() => window.open(`/diamond/${auction.stock_number}`, '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              צפה ביהלום
            </Button>
          </div>
        </div>

        {/* Latest Bids */}
        {auction.bids && auction.bids.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              הצעות אחרונות
            </h3>
            <div className="space-y-1">
              {auction.bids.slice(0, 5).map((bid) => (
                <div key={bid.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
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
