import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createAuction, AuctionCreateRequest } from '@/lib/n8n-auction';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface CreateAuctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diamond: {
    stock_number: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cut?: string;
    picture?: string;
    certificate_url?: string;
    price_per_carat?: number;
  };
}

export function CreateAuctionModal({ open, onOpenChange, diamond }: CreateAuctionModalProps) {
  const { user } = useTelegramAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  const [bidIncrement, setBidIncrement] = useState<number>(100);
  const [customIncrement, setCustomIncrement] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [reservePrice, setReservePrice] = useState<string>('');
  const [startingPrice, setStartingPrice] = useState<string>(
    diamond.price_per_carat && diamond.weight 
      ? String(Math.round(diamond.price_per_carat * diamond.weight))
      : ''
  );

  const handleCreate = async () => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    if (!startingPrice || isNaN(Number(startingPrice)) || Number(startingPrice) <= 0) {
      toast.error('Please enter a valid starting price');
      return;
    }

    const finalIncrement = bidIncrement === 0 && customIncrement 
      ? Number(customIncrement) 
      : bidIncrement;

    if (finalIncrement <= 0) {
      toast.error('Please set a valid bid increment');
      return;
    }

    setIsCreating(true);

    try {
      const auctionRequest: AuctionCreateRequest = {
        stockNumber: diamond.stock_number,
        startingPrice: Number(startingPrice),
        minIncrement: finalIncrement,
        currency: 'USD',
        durationMinutes: duration,
        reservePrice: reservePrice ? Number(reservePrice) : undefined,
        sellerTelegramId: user.id,
        diamondData: {
          shape: diamond.shape,
          weight: diamond.weight,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          picture: diamond.picture,
          certificateUrl: diamond.certificate_url,
          pricePerCarat: diamond.price_per_carat,
        },
        groupChatIds: [-1002312345678], // TODO: Get from settings
      };

      const result = await createAuction(auctionRequest);

      if (result.success) {
        toast.success('🎉 Auction created and broadcasted to groups!');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to create auction');
      }
    } catch (error) {
      console.error('Auction creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create auction');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Auction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Diamond Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{diamond.stock_number}</p>
            <p className="text-xs text-muted-foreground">
              {diamond.weight}ct {diamond.shape} {diamond.color} {diamond.clarity}
            </p>
          </div>

          {/* Starting Price */}
          <div className="space-y-2">
            <Label htmlFor="startingPrice">Starting Price ($)</Label>
            <Input
              id="startingPrice"
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="Enter starting price"
            />
          </div>

          {/* Bid Increment */}
          <div className="space-y-2">
            <Label>Bid Increment ($)</Label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant={bidIncrement === 50 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBidIncrement(50)}
              >
                $50
              </Button>
              <Button
                type="button"
                variant={bidIncrement === 100 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBidIncrement(100)}
              >
                $100
              </Button>
              <Button
                type="button"
                variant={bidIncrement === 150 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBidIncrement(150)}
              >
                $150
              </Button>
              <Button
                type="button"
                variant={bidIncrement === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBidIncrement(0)}
              >
                Custom
              </Button>
            </div>
            {bidIncrement === 0 && (
              <Input
                type="number"
                value={customIncrement}
                onChange={(e) => setCustomIncrement(e.target.value)}
                placeholder="Enter custom increment"
                className="mt-2"
              />
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={String(duration)} onValueChange={(val) => setDuration(Number(val))}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reserve Price (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="reservePrice">Reserve Price (Optional)</Label>
            <Input
              id="reservePrice"
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              placeholder="Minimum acceptable price"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Auction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
