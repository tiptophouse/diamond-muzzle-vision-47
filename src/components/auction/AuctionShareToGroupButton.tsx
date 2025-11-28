import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuctionShareToGroupButtonProps {
  auctionId: string;
  stockNumber: string;
  currentPrice: number;
  minIncrement: number;
  currency: string;
  endsAt: string;
  imageUrl?: string;
}

export function AuctionShareToGroupButton({
  auctionId,
  stockNumber,
  currentPrice,
  minIncrement,
  currency,
  endsAt,
  imageUrl,
}: AuctionShareToGroupButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { webApp, hapticFeedback } = useTelegramWebApp();

  const handleShareToGroup = async () => {
    if (!webApp) {
      toast.error('Telegram Web App not available');
      return;
    }

    setIsSharing(true);
    hapticFeedback.impact('medium');

    try {
      console.log('📤 Sharing auction to B2B group:', auctionId);

      // Call send-auction-message edge function
      const { data, error } = await supabase.functions.invoke('send-auction-message', {
        body: {
          auction_id: auctionId,
          stock_number: stockNumber,
          current_price: currentPrice,
          min_increment: minIncrement,
          currency: currency,
          ends_at: endsAt,
          image_url: imageUrl,
        },
      });

      if (error) {
        console.error('❌ Error sharing auction:', error);
        throw error;
      }

      console.log('✅ Auction shared successfully:', data);
      hapticFeedback.notification('success');
      toast.success('🎉 המכרז שותף לקבוצת B2B בהצלחה!');
    } catch (error) {
      console.error('❌ Error sharing auction:', error);
      hapticFeedback.notification('error');
      toast.error('שגיאה בשיתוף המכרז');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShareToGroup}
      disabled={isSharing}
      className="w-full"
      variant="default"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {isSharing ? 'משתף...' : 'שתף לקבוצת B2B'}
    </Button>
  );
}
