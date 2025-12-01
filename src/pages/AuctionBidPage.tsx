import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuction, usePlaceBid } from '@/hooks/api/useAuctions';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Gavel, Clock, DollarSign } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';

export default function AuctionBidPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();

  const action = searchParams.get('action');
  const numericAuctionId = Number(auctionId);

  const { data: auction, isLoading, error } = useAuction(numericAuctionId);
  const placeBidMutation = usePlaceBid(numericAuctionId);

  // Auto-trigger bid if action=bid and auction is active
  useEffect(() => {
    if (action === 'bid' && auction && auction.state === 'active' && user) {
      handlePlaceBid();
    }
  }, [action, auction, user]);

  const handlePlaceBid = () => {
    if (!user || !auction) return;

    const nextBid = auction.current_price + auction.min_increment;

    placeBidMutation.mutate({
      user_id: user.id,
      amount: nextBid,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTimeRemaining = () => {
    if (!auction) return '';
    const now = new Date();
    const end = new Date(auction.end_time);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'המכרז הסתיים';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}:${minutes.toString().padStart(2, '0')} שעות`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">מכרז לא נמצא</h2>
            <p className="text-muted-foreground mb-4">המכרז שחיפשת אינו קיים או הוסר</p>
            <Button onClick={() => navigate('/store')}>חזרה לחנות</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const diamond = auction.auction_diamond;
  const nextBidAmount = auction.current_price + auction.min_increment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            חזרה
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Auction Status Badge */}
        <div className="flex justify-center mb-6">
          <Badge 
            variant={auction.state === 'active' ? 'default' : 'secondary'}
            className="text-lg px-4 py-2"
          >
            <Gavel className="h-4 w-4 mr-2" />
            {auction.state === 'active' ? 'מכרז פעיל' : 'מכרז הסתיים'}
          </Badge>
        </div>

        {/* Diamond Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>💎 {diamond.weight}ct {diamond.shape}</span>
              {diamond.picture && (
                <img 
                  src={diamond.picture} 
                  alt="Diamond"
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">צבע:</span>
                <span className="font-medium mr-2">{diamond.color}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ניקיון:</span>
                <span className="font-medium mr-2">{diamond.clarity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">חיתוך:</span>
                <span className="font-medium mr-2">{diamond.cut}</span>
              </div>
              <div>
                <span className="text-muted-foreground">מלאי:</span>
                <span className="font-medium mr-2">{diamond.stock}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auction Details Card */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">מחיר נוכחי:</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(auction.current_price)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">זמן נותר:</span>
              </div>
              <span className="font-medium">{getTimeRemaining()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">הצעה הבאה:</span>
              <span className="text-xl font-bold">
                {formatPrice(nextBidAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bid Button */}
        {auction.state === 'active' && user && (
          <Button
            onClick={handlePlaceBid}
            disabled={placeBidMutation.isPending}
            className="w-full h-14 text-lg"
            size="lg"
          >
            <Gavel className="h-5 w-5 mr-2" />
            {placeBidMutation.isPending 
              ? 'שולח הצעה...' 
              : `💰 הצע ${formatPrice(nextBidAmount)}`
            }
          </Button>
        )}

        {auction.state !== 'active' && (
          <Card className="bg-muted">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">המכרז הסתיים</p>
              {auction.current_winner_id && (
                <p className="font-medium mt-2">
                  הצעה זוכה: {formatPrice(auction.current_price)}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
