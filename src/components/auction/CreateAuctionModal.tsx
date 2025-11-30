import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { callN8NWorkflow } from '@/lib/n8n';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
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
      console.log('📡 Calling n8n AUCTION_CREATE_ENGINE workflow...');
      
      // Call n8n workflow to create auction + broadcast to Telegram groups
      const result = await callN8NWorkflow('auction_create', {
        stockNumber: diamond.stockNumber,
        startingPrice: Number(startingPrice),
        minIncrement: Number(activeBidIncrement),
        duration: Number(duration), // minutes
        buyNowPrice: buyNowPrice ? Number(buyNowPrice) : null,
        sellerTelegramId: userId,
        diamond: {
          shape: diamond.shape,
          carat: diamond.carat,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          picture: diamond.picture,
          price: diamond.price,
        },
      });

      console.log('📊 n8n response:', result);
      
      if (!result.success) {
        const errorMsg = result.error || 'n8n workflow failed';
        const details = result.details || {};
        
        console.error('❌ n8n workflow returned error:', {
          error: errorMsg,
          details,
        });
        
        hapticFeedback.notification('error');
        
        // Show detailed error with n8n context
        toast({ 
          title: 'שגיאה ביצירת מכרז', 
          description: errorMsg,
          variant: 'destructive',
          duration: 7000,
        });
        alert(`❌ ${errorMsg}\n\nפרטים נוספים:\n${JSON.stringify(details, null, 2)}`);
        return;
      }

      console.log('✅ Auction created via n8n:', result.data);
      
      hapticFeedback.notification('success');
      toast({
        title: '🎉 מכרז נוצר ושותף בהצלחה!',
        description: `מכרז ${stockNumber} נשלח לטלגרם עם כפתורי הצעה`,
        duration: 3000,
      });
      
      onOpenChange(false);
      onSuccess?.(result.data?.auctionId || '');
    } catch (error: any) {
      console.error('❌ AUCTION CREATION FAILED:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        stack: error?.stack,
      });
      
      hapticFeedback.notification('error');
      
      const errorMsg = error?.message || error?.error || 'לא ניתן ליצור מכרז כרגע';
      toast({ 
        title: 'שגיאה ביצירת מכרז', 
        description: errorMsg, 
        variant: 'destructive',
        duration: 7000, 
      });
      alert(`❌ שגיאה: ${errorMsg}\n\nפרטים:\n${JSON.stringify(error, null, 2)}`); // Backup alert with full error
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
            disabled={isSubmitting || !startingPrice || !activeBidIncrement}
            className="w-full h-12 text-base font-semibold"
          >
            {isSubmitting ? (
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
