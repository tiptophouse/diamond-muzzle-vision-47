import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateAuction } from '@/hooks/api/useAuctions';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DiamondData {
  id: number;
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
  sellerTelegramId: number;
  sellerUsername?: string;
  onSuccess?: (auctionId: number) => void;
}

export function CreateAuctionModal({
  open,
  onOpenChange,
  stockNumber,
  diamondName,
  diamond,
  sellerTelegramId,
  sellerUsername,
  onSuccess,
}: CreateAuctionModalProps) {
  const [startingPrice, setStartingPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('50');
  const [expiryHours, setExpiryHours] = useState('24');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const createAuctionMutation = useCreateAuction();

  const handleCreateAuction = async () => {
    // Validation
    if (!startingPrice || Number(startingPrice) <= 0) {
      toast({ 
        title: '❌ שגיאה', 
        description: 'נא להזין מחיר התחלתי תקין', 
        variant: 'destructive' 
      });
      hapticFeedback.notification('error');
      return;
    }

    if (!diamond.id || diamond.id === 0) {
      toast({ 
        title: '❌ שגיאה', 
        description: `מזהה יהלום חסר (ID: ${diamond.id})`, 
        variant: 'destructive' 
      });
      hapticFeedback.notification('error');
      console.error('❌ Diamond ID missing or zero:', diamond);
      return;
    }

    setIsCreating(true);
    hapticFeedback.impact('light');
    
    // Show loading toast
    toast({
      title: '⏳ יוצר מכרז...',
      description: 'אנא המתן',
    });

    try {
      // Calculate end time
      const startTime = new Date();
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + Number(expiryHours));

      console.log('🔨 Creating auction via FastAPI...', {
        diamond_id: diamond.id,
        start_price: Number(startingPrice),
        min_increment: Number(minIncrement),
      });

      // Step 1: Create auction via FastAPI
      const auction = await createAuctionMutation.mutateAsync({
        diamond_id: diamond.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        start_price: Number(startingPrice),
        min_increment: Number(minIncrement),
      });

      console.log('✅ Auction created via FastAPI:', auction);
      
      hapticFeedback.notification('success');
      toast({
        title: '✅ מכרז נוצר בהצלחה!',
        description: `מכרז #${auction.id} נוצר עבור ${stockNumber}`,
      });

      // Step 2: Send message to Telegram group (non-blocking)
      try {
        const { error: sendError } = await supabase.functions.invoke('send-auction-message', {
          body: {
            auction_id: auction.id.toString(),
            stock_number: stockNumber,
            current_price: Number(startingPrice),
            min_increment: Number(minIncrement),
            currency: 'USD',
            ends_at: endTime.toISOString(),
            image_url: diamond.picture || undefined,
            seller_telegram_id: sellerTelegramId,
            seller_username: sellerUsername,
            diamond: {
              shape: diamond.shape,
              weight: diamond.carat,
              color: diamond.color,
              clarity: diamond.clarity,
              cut: diamond.cut,
              stock_number: stockNumber,
              price_per_carat: diamond.price / diamond.carat,
              picture: diamond.picture,
            },
          }
        });

        if (sendError) {
          console.error('⚠️ Failed to send auction message to group:', sendError);
          toast({ 
            title: '⚠️ המכרז נוצר', 
            description: 'אך השיתוף לקבוצה נכשל. ניתן לשתף ידנית.',
            variant: 'default'
          });
        } else {
          console.log('✅ Auction message sent to group');
          toast({ 
            title: '📤 המכרז שותף לקבוצה!', 
            description: 'המכרז נשלח בהצלחה' 
          });
        }
      } catch (shareError) {
        console.error('⚠️ Error sharing auction:', shareError);
        // Don't fail the whole operation - auction was created
      }

      onOpenChange(false);
      onSuccess?.(auction.id);
      
    } catch (error: any) {
      console.error('❌ Failed to create auction:', error);
      hapticFeedback.notification('error');
      
      toast({
        title: '❌ שגיאה ביצירת מכרז',
        description: error.message || 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🔨 יצירת מכרז</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Diamond Preview Card */}
          <Card className="p-4 bg-muted/50">
            <div className="flex gap-3">
              {diamond.picture && (
                <img 
                  src={diamond.picture} 
                  alt={diamondName}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{diamondName}</p>
                <p className="text-sm text-muted-foreground">
                  {diamond.carat}ct • {diamond.color} • {diamond.clarity}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {diamond.id || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="starting-price">מחיר התחלתי ($)</Label>
            <Input
              id="starting-price"
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="5000"
              min="0"
              step="100"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-increment">הפרש מינימלי להצעה</Label>
            <Select value={minIncrement} onValueChange={setMinIncrement} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">$50</SelectItem>
                <SelectItem value="100">$100</SelectItem>
                <SelectItem value="150">$150</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">זמן תפוגה</Label>
            <Select value={expiryHours} onValueChange={setExpiryHours} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">שעה אחת</SelectItem>
                <SelectItem value="3">3 שעות</SelectItem>
                <SelectItem value="6">6 שעות</SelectItem>
                <SelectItem value="12">12 שעות</SelectItem>
                <SelectItem value="24">24 שעות</SelectItem>
                <SelectItem value="48">48 שעות</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateAuction}
            disabled={isCreating || !startingPrice}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                יוצר מכרז...
              </>
            ) : (
              '📤 צור מכרז ושלח לקבוצה'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
