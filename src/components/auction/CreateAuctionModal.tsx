import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createAuction } from '@/lib/auctions';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DiamondData {
  stockNumber: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  picture?: string;
}

interface CreateAuctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockNumber: string;
  diamondName: string;
  diamond: DiamondData;
  onSuccess?: (auctionId: string) => void;
}

export function CreateAuctionModal({
  open,
  onOpenChange,
  stockNumber,
  diamondName,
  diamond,
  onSuccess,
}: CreateAuctionModalProps) {
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('50');
  const [durationHours, setDurationHours] = useState('24');
  const [autoExtend, setAutoExtend] = useState(true);
  const [notifySeller, setNotifySeller] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();

  const handleCreateAuction = async () => {
    if (!startingPrice || Number(startingPrice) <= 0) {
      toast({ title: 'שגיאה', description: 'נא להזין מחיר התחלתי תקין', variant: 'destructive' });
      hapticFeedback.notification('error');
      return;
    }

    const userId = user?.id;
    if (!userId) {
      toast({ title: 'שגיאה', description: 'לא ניתן לזהות משתמש', variant: 'destructive' });
      hapticFeedback.notification('error');
      return;
    }

    console.log('🔨 Creating auction with seller_telegram_id:', userId);
    setIsSubmitting(true);
    hapticFeedback.impact('light');

    try {
      // Step 1: Create auction
      const auction = await createAuction({
        stock_number: stockNumber,
        starting_price: Number(startingPrice),
        reserve_price: reservePrice ? Number(reservePrice) : null,
        min_increment: Number(minIncrement),
        duration_hours: Number(durationHours),
        seller_telegram_id: userId,
        auto_extend: autoExtend,
        notify_seller: notifySeller,
        diamond_data: {
          description: diamondName,
          image: diamond.picture,
          carat: diamond.carat,
          shape: diamond.shape,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut
        }
      });

      console.log('✅ Auction created:', auction.id);

      // Step 2: Send message to test group
      try {
        const endsAt = new Date();
        endsAt.setHours(endsAt.getHours() + Number(durationHours));

        const diamondDescription = `💎 ${diamond.carat}ct ${diamond.shape}
🎨 Color: ${diamond.color} | Clarity: ${diamond.clarity}
✨ Cut: ${diamond.cut}
📦 Stock: ${diamond.stockNumber}`;

        const { error: sendError } = await supabase.functions.invoke('send-auction-message', {
          body: {
            auction_id: auction.id,
            stock_number: stockNumber,
            diamond_description: diamondDescription,
            current_price: Number(startingPrice),
            min_increment: Number(minIncrement),
            currency: 'USD',
            ends_at: endsAt.toISOString(),
            image_url: diamond.picture || undefined,
          }
        });

        if (sendError) {
          console.error('Failed to send auction message:', sendError);
          toast({ 
            title: '⚠️ המכרז נוצר', 
            description: 'אך השיתוף לקבוצה נכשל. ניתן לשתף ידנית.',
            variant: 'default'
          });
        } else {
          console.log('✅ Auction message sent to group');
          hapticFeedback.notification('success');
          toast({ 
            title: '✅ המכרז נוצר ושותף בהצלחה!', 
            description: 'המכרז נשלח לקבוצת הבדיקה' 
          });
        }
      } catch (shareError) {
        console.error('Error sharing auction:', shareError);
        toast({ 
          title: '⚠️ המכרז נוצר', 
          description: 'אך השיתוף לקבוצה נכשל',
          variant: 'default'
        });
      }

      onOpenChange(false);
      onSuccess?.(auction.id);
    } catch (error) {
      console.error('Failed to create auction:', error);
      hapticFeedback.notification('error');
      toast({ 
        title: 'שגיאה', 
        description: 'לא ניתן ליצור מכרז כרגע', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🔨 יצירת מכרז - {diamondName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="starting-price">מחיר התחלתי ($)</Label>
            <Input
              id="starting-price"
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-increment">הפרש מינימלי ($)</Label>
            <Input
              id="min-increment"
              type="number"
              value={minIncrement}
              onChange={(e) => setMinIncrement(e.target.value)}
              placeholder="50"
              min="1"
              step="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">משך הזמן (שעות)</Label>
            <Input
              id="duration"
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              placeholder="24"
              min="1"
              max="168"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserve-price">מחיר מינימום (אופציונלי $)</Label>
            <Input
              id="reserve-price"
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              placeholder="מחיר מינימום לקבלה"
              min="0"
              step="100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify-seller"
              checked={notifySeller}
              onChange={(e) => setNotifySeller(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="notify-seller" className="cursor-pointer">
              שלח התראות על הצעות חדשות
            </Label>
          </div>

          <Button
            onClick={handleCreateAuction}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'יוצר מכרז...' : '🔨 צור מכרז'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
