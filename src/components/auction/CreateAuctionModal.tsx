import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createAuction } from '@/lib/auctions';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface CreateAuctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockNumber: string;
  diamondName: string;
  onSuccess?: (auctionId: string) => void;
}

export function CreateAuctionModal({
  open,
  onOpenChange,
  stockNumber,
  diamondName,
  onSuccess,
}: CreateAuctionModalProps) {
  const [startingPrice, setStartingPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('50');
  const [durationHours, setDurationHours] = useState('24');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();

  const handleCreateAuction = async () => {
    if (!startingPrice || Number(startingPrice) <= 0) {
      toast({ title: 'שגיאה', description: 'נא להזין מחיר התחלתי תקין', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    hapticFeedback.impact('light');

    try {
      const auction = await createAuction({
        stock_number: stockNumber,
        starting_price: Number(startingPrice),
        min_increment: Number(minIncrement),
        duration_hours: Number(durationHours),
      });

      hapticFeedback.notification('success');
      toast({ 
        title: '✅ המכרז נוצר בהצלחה!', 
        description: 'ניתן כעת לשתף אותו בטלגרם' 
      });
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
