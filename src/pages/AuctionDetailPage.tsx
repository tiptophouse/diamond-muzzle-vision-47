import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Hammer, 
  Clock, 
  TrendingUp, 
  Eye, 
  Users, 
  ArrowLeft, 
  Share2,
  Gem 
} from "lucide-react";
import { getAuctionById, placeBid } from "@/lib/auctions";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useRealtimeAuctionViews } from "@/hooks/useRealtimeAuctionViews";
import { formatCurrency } from "@/utils/numberUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const { impactOccurred } = useTelegramHapticFeedback();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const { viewCount, uniqueViewers } = useRealtimeAuctionViews(id || '');

  useEffect(() => {
    if (!id) return;

    const fetchAuction = async () => {
      try {
        setLoading(true);
        const data = await getAuctionById(id);
        setAuction(data);

        // Track view
        await supabase.from('auction_analytics').insert({
          auction_id: id,
          telegram_id: user?.id,
          event_type: 'view',
          event_data: {
            viewed_at: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to fetch auction:', error);
        toast.error("נכשל בטעינת המכרז");
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();

    // Subscribe to realtime updates for bids
    const channel = supabase
      .channel(`auction-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_bids',
          filter: `auction_id=eq.${id}`,
        },
        () => {
          fetchAuction(); // Refetch on new bid
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id]);

  const timeRemaining = () => {
    if (!auction) return "";
    const now = new Date();
    const end = new Date(auction.ends_at);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "המכרז הסתיים";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} ימים ${hours % 24} שעות`;
    }
    
    return `${hours} שעות ${minutes} דקות`;
  };

  const handleBid = async () => {
    if (!id || !auction || !user?.id) {
      toast.error("יש להתחבר כדי להציע");
      return;
    }

    if (auction.seller_telegram_id === user.id) {
      toast.error("אי אפשר להציע על המכרז שלך");
      return;
    }

    setBidding(true);
    impactOccurred('medium');

    try {
      await placeBid(id);
      impactOccurred('light');
      toast.success("ההצעה הוגשה בהצלחה!");
      
      // Refetch auction data
      const data = await getAuctionById(id);
      setAuction(data);
    } catch (error) {
      console.error('Failed to place bid:', error);
      impactOccurred('heavy');
      toast.error(error instanceof Error ? error.message : "נכשל בהגשת ההצעה");
    } finally {
      setBidding(false);
    }
  };

  const handleShare = async () => {
    if (!auction || !user?.id) return;

    impactOccurred('medium');

    try {
      const diamond = auction.diamond;
      const diamondDesc = diamond 
        ? `${diamond.weight}ct ${diamond.shape} ${diamond.color} ${diamond.clarity}${diamond.cut ? ` ${diamond.cut}` : ''}`
        : auction.stock_number;
      
      const { error } = await supabase.functions.invoke('send-auction-message', {
        body: {
          auction_id: auction.id,
          stock_number: auction.stock_number,
          diamond_description: diamondDesc,
          current_price: auction.current_price,
          min_increment: auction.min_increment,
          currency: auction.currency,
          ends_at: auction.ends_at,
          image_url: diamond?.picture,
          bid_count: auction.bid_count || 0,
          view_count: viewCount || 0,
          shared_by: user.id,
          shared_by_name: user.first_name,
          test_mode: false,
        },
      });

      if (error) throw error;

      impactOccurred('light');
      toast.success("המכרז שותף בהצלחה!");
    } catch (error) {
      console.error('Share failed:', error);
      impactOccurred('heavy');
      toast.error("שיתוף נכשל");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl py-6 space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <Hammer className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">המכרז לא נמצא</h2>
        <Button onClick={() => navigate('/auctions')} className="mt-4">
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזור למכרזים
        </Button>
      </div>
    );
  }

  const diamond = auction.diamond;
  const nextBidAmount = auction.current_price + auction.min_increment;

  return (
    <div className="container max-w-2xl py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/auctions')}
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזור
        </Button>
        <Badge variant="secondary">
          <Clock className="h-3 w-3 ml-1" />
          {timeRemaining()}
        </Badge>
      </div>

      {/* Diamond Image */}
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-muted">
          {diamond?.picture ? (
            <img
              src={diamond.picture}
              alt={`${diamond.shape} diamond`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gem className="h-24 w-24 text-muted-foreground opacity-30" />
            </div>
          )}
        </div>
      </Card>

      {/* Auction Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {diamond ? (
                  `${diamond.weight}ct ${diamond.shape}`
                ) : (
                  auction.stock_number
                )}
              </h1>
              {diamond && (
                <p className="text-muted-foreground">
                  {diamond.color} • {diamond.clarity} {diamond.cut && `• ${diamond.cut}`}
                </p>
              )}
            </div>
            <Badge variant="outline">
              מלאי: {auction.stock_number}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Price */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">מחיר נוכחי</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(auction.current_price)} {auction.currency}
            </p>
          </div>

          {/* Next Bid */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">הצעה הבאה:</span>
            <span className="text-lg font-bold">
              {formatCurrency(nextBidAmount)} {auction.currency}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{auction.bid_count || 0}</p>
              <p className="text-xs text-muted-foreground">הצעות</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Eye className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{viewCount}</p>
              <p className="text-xs text-muted-foreground">צפיות</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{uniqueViewers}</p>
              <p className="text-xs text-muted-foreground">צופים</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleBid}
              disabled={
                bidding ||
                auction.status !== 'active' ||
                auction.seller_telegram_id === user?.id ||
                new Date(auction.ends_at) < new Date()
              }
            >
              {bidding ? (
                "מגיש הצעה..."
              ) : (
                <>
                  <Hammer className="h-5 w-5 ml-2" />
                  הצע {formatCurrency(nextBidAmount)}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bids */}
      {auction.bids && auction.bids.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">הצעות אחרונות</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auction.bids.map((bid: any) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {bid.bidder_name || `משתמש ${bid.bidder_telegram_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.created_at).toLocaleString('he-IL')}
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(bid.bid_amount)} {auction.currency}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
