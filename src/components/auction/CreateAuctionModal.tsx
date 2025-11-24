import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createAuction } from '@/lib/auctions';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useAuctionViralMechanics } from '@/hooks/useAuctionViralMechanics';
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
  const [minIncrement, setMinIncrement] = useState('50');
  const [durationHours, setDurationHours] = useState('24');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const { shareToGroups, isSharing } = useAuctionViralMechanics();

  const handleCreateAuction = async () => {
    console.log('🚀 handleCreateAuction CALLED');
    
    if (!startingPrice || Number(startingPrice) <= 0) {
      console.error('❌ Validation failed: Invalid starting price');
      const errorMsg = 'נא להזין מחיר התחלתי תקין';
      toast({ title: 'שגיאה', description: errorMsg, variant: 'destructive' });
      alert(errorMsg); // Backup alert
      hapticFeedback.notification('error');
      return;
    }

    const userId = user?.id;
    if (!userId) {
      console.error('❌ Validation failed: No user ID');
      const errorMsg = 'לא ניתן לזהות משתמש';
      toast({ title: 'שגיאה', description: errorMsg, variant: 'destructive' });
      alert(errorMsg); // Backup alert
      hapticFeedback.notification('error');
      return;
    }

    console.log('✅ Validation passed');
    console.log('🔨 Creating auction with:', { stockNumber, startingPrice, minIncrement, durationHours, userId });
    setIsSubmitting(true);
    hapticFeedback.impact('light');

    try {
      console.log('📡 Calling createAuction...');
      
      // Step 1: Prepare diamond snapshot from FastAPI data
      const diamondSnapshot = {
        stock_number: diamond.stockNumber,
        shape: diamond.shape,
        weight: diamond.carat,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        picture: diamond.picture,
        total_price: diamond.price,
      };
      
      // Step 2: Create auction with snapshot
      const auction = await createAuction({
        stock_number: stockNumber,
        starting_price: Number(startingPrice),
        min_increment: Number(minIncrement),
        duration_hours: Number(durationHours),
        seller_telegram_id: userId,
        diamond_snapshot: diamondSnapshot,
      });

      console.log('✅ Auction created:', auction.id);

      // Step 2: AUTO-SHARE TO MULTIPLE GROUPS (VIRAL MECHANICS)
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + Number(durationHours));

      const diamondDescription = `💎 ${diamond.carat}ct ${diamond.shape}
🎨 Color: ${diamond.color} | Clarity: ${diamond.clarity}
✨ Cut: ${diamond.cut}
📦 Stock: ${diamond.stockNumber}`;

      const sharedSuccessfully = await shareToGroups({
        auctionId: auction.id,
        stockNumber,
        diamondDescription,
        currentPrice: Number(startingPrice),
        minIncrement: Number(minIncrement),
        currency: 'USD',
        endsAt: endsAt.toISOString(),
        imageUrl: diamond.picture,
        groupIds: [-1002178695748], // Test group for auction auto-sharing
      });

      if (!sharedSuccessfully) {
        toast({ 
          title: '⚠️ המכרז נוצר', 
          description: 'אך השיתוף לקבוצות נכשל. ניתן לשתף ידנית.',
          variant: 'default'
        });
      }

      onOpenChange(false);
      onSuccess?.(auction.id);
    } catch (error: any) {
      console.error('❌ AUCTION CREATION FAILED:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
        code: error?.code
      });
      
      hapticFeedback.notification('error');
      
      const errorMsg = error?.message || 'לא ניתן ליצור מכרז כרגע';
      toast({ 
        title: 'שגיאה ביצירת מכרז', 
        description: errorMsg, 
        variant: 'destructive' 
      });
      alert(`שגיאה: ${errorMsg}`); // Backup alert
    } finally {
      console.log('🏁 Auction creation flow finished');
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
            disabled={isSubmitting || isSharing}
            className="w-full"
          >
            {isSubmitting || isSharing ? 'יוצר ומשתף...' : '🔨 צור מכרז'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
