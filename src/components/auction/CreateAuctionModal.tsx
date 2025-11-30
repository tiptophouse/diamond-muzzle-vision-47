import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createAuction } from '@/lib/auctions';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useAuctionViralMechanics } from '@/hooks/useAuctionViralMechanics';
import { supabase } from '@/integrations/supabase/client';
import { Gem, Clock, DollarSign } from 'lucide-react';

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
  const [customIncrement, setCustomIncrement] = useState('');
  const [duration, setDuration] = useState('60'); // minutes
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();
  const { shareToGroups, isSharing } = useAuctionViralMechanics();
  
  const BID_PRESETS = [
    { value: '50', label: '$50' },
    { value: '100', label: '$100' },
    { value: '150', label: '$150' },
    { value: 'custom', label: 'אחר' },
  ];
  
  const DURATION_OPTIONS = [
    { value: '15', label: '15 דקות' },
    { value: '30', label: '30 דקות' },
    { value: '45', label: '45 דקות' },
    { value: '60', label: 'שעה' },
    { value: '120', label: '2 שעות' },
    { value: '180', label: '3 שעות' },
  ];
  
  const activeBidIncrement = minIncrement === 'custom' 
    ? customIncrement 
    : minIncrement;
  
  // Safety check: Don't render if user context is not available
  if (!user) {
    console.error('❌ User context not available in CreateAuctionModal');
    return null;
  }

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
    console.log('🔨 Creating auction with:', { 
      stockNumber, 
      startingPrice, 
      minIncrement: activeBidIncrement, 
      duration: `${duration} minutes`, 
      userId 
    });
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
      
      // Step 2: Create auction with snapshot (convert minutes to hours)
      const durationHours = Number(duration) / 60;
      const auction = await createAuction({
        stock_number: stockNumber,
        starting_price: Number(startingPrice),
        min_increment: Number(activeBidIncrement),
        duration_hours: durationHours,
        seller_telegram_id: userId,
        diamond_snapshot: diamondSnapshot,
      });

      console.log('✅ Auction created:', auction.id);
      
      hapticFeedback.notification('success');
      toast({
        title: '✅ מכרז נוצר בהצלחה!',
        description: `מכרז ${stockNumber} נפתח`,
        duration: 2000,
      });

      // Step 3: AUTO-SHARE TO MULTIPLE GROUPS (VIRAL MECHANICS)
      const endsAt = new Date();
      endsAt.setMinutes(endsAt.getMinutes() + Number(duration));

      const diamondDescription = `💎 ${diamond.carat}ct ${diamond.shape}
🎨 Color: ${diamond.color} | Clarity: ${diamond.clarity}
✨ Cut: ${diamond.cut}
📦 Stock: ${diamond.stockNumber}`;

      console.log('📤 Starting auto-share to Telegram groups...');
      
      const sharedSuccessfully = await shareToGroups({
        auctionId: auction.id,
        stockNumber,
        diamondDescription,
        currentPrice: Number(startingPrice),
        minIncrement: Number(activeBidIncrement),
        currency: 'USD',
        endsAt: endsAt.toISOString(),
        imageUrl: diamond.picture,
        groupIds: [-1002178695748], // Test group for auction auto-sharing
      });

      if (!sharedSuccessfully) {
        console.error('⚠️ Sharing to groups failed but auction was created');
        toast({ 
          title: '⚠️ המכרז נוצר', 
          description: 'אך השיתוף לטלגרם נכשל. בדוק לוגים.',
          variant: 'default',
          duration: 5000,
        });
        // Don't close modal on sharing failure - let user retry
        return;
      }

      console.log('✅ Auction shared successfully to Telegram groups');
      hapticFeedback.notification('success');
      toast({
        title: '🎉 מכרז שותף בהצלחה!',
        description: 'המכרז נשלח לטלגרם עם כפתורי הצעה',
        duration: 3000,
      });
      
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            יצירת מכרז חדש
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Diamond Preview Card */}
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {diamond.picture && (
                  <img 
                    src={diamond.picture} 
                    alt={diamondName}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{diamondName}</p>
                  <p className="text-xs text-muted-foreground">
                    {diamond.carat}ct • {diamond.color} • {diamond.clarity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    מלאי: {stockNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Starting Price */}
          <div className="space-y-2">
            <Label htmlFor="starting-price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              מחיר התחלתי ($)
            </Label>
            <Input
              id="starting-price"
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="הזן מחיר התחלתי"
              min="0"
              step="100"
              className="text-lg font-semibold"
            />
          </div>

          {/* Bid Increment Presets */}
          <div className="space-y-2">
            <Label>הפרש הצעה מינימלי</Label>
            <div className="grid grid-cols-4 gap-2">
              {BID_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant={minIncrement === preset.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setMinIncrement(preset.value);
                    hapticFeedback.impact('light');
                  }}
                  className="font-semibold"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {minIncrement === 'custom' && (
              <Input
                type="number"
                value={customIncrement}
                onChange={(e) => setCustomIncrement(e.target.value)}
                placeholder="הזן סכום"
                min="1"
                step="10"
                className="mt-2"
              />
            )}
          </div>

          {/* Duration Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              משך המכרז
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="בחר משך זמן" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buy Now Price (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="buy-now-price" className="text-muted-foreground">
              מחיר קנייה מיידית (אופציונלי)
            </Label>
            <Input
              id="buy-now-price"
              type="number"
              value={buyNowPrice}
              onChange={(e) => setBuyNowPrice(e.target.value)}
              placeholder="השאר ריק אם אין"
              min="0"
              step="100"
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateAuction}
            disabled={isSubmitting || isSharing || !startingPrice || !activeBidIncrement}
            className="w-full h-12 text-base font-semibold"
          >
            {isSubmitting || isSharing ? (
              <>
                <span className="animate-pulse">יוצר ומשתף...</span>
              </>
            ) : (
              <>
                🔨 צור מכרז ושתף לקבוצות
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            המכרז ישותף אוטומטית לקבוצות טלגרם עם כפתורי הצעה
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
