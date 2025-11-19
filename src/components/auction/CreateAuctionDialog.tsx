import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hammer, Loader2 } from "lucide-react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { createAuction } from "@/lib/auctions";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/numberUtils";

interface CreateAuctionDialogProps {
  diamond: Diamond;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAuctionDialog({ 
  diamond, 
  open, 
  onOpenChange,
  onSuccess 
}: CreateAuctionDialogProps) {
  const { user } = useTelegramAuth();
  const { impactOccurred } = useTelegramHapticFeedback();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    starting_price: diamond.price || 0,
    min_increment: Math.max(50, Math.round((diamond.price || 0) * 0.05)),
    duration_hours: 24,
  });

  const handleCreate = async () => {
    if (!user?.id) {
      toast.error("יש להתחבר כדי ליצור מכרז");
      return;
    }

    if (formData.starting_price <= 0) {
      toast.error("מחיר פתיחה חייב להיות גבוה מ-0");
      return;
    }

    setIsCreating(true);
    impactOccurred('medium');

    try {
      await createAuction({
        stock_number: diamond.stockNumber,
        starting_price: formData.starting_price,
        min_increment: formData.min_increment,
        duration_hours: formData.duration_hours,
        currency: 'USD',
        seller_telegram_id: user.id,
      });

      impactOccurred('light');
      toast.success("המכרז נוצר בהצלחה!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create auction:', error);
      impactOccurred('heavy');
      toast.error(error instanceof Error ? error.message : "נכשל ביצירת המכרז");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-primary" />
            יצירת מכרז חי
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Diamond Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {diamond.carat}ct {diamond.shape} {diamond.color} {diamond.clarity}
            </p>
            <p className="text-xs text-muted-foreground">
              מלאי: {diamond.stockNumber}
            </p>
          </div>

          {/* Starting Price */}
          <div className="space-y-2">
            <Label htmlFor="starting_price">מחיר פתיחה (USD)</Label>
            <Input
              id="starting_price"
              type="number"
              min="1"
              value={formData.starting_price}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                starting_price: Number(e.target.value) 
              }))}
              placeholder="0"
            />
          </div>

          {/* Min Increment */}
          <div className="space-y-2">
            <Label htmlFor="min_increment">הפרש הצעה מינימלי (USD)</Label>
            <Input
              id="min_increment"
              type="number"
              min="1"
              value={formData.min_increment}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                min_increment: Number(e.target.value) 
              }))}
              placeholder="50"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">משך המכרז (שעות)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="168"
              value={formData.duration_hours}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                duration_hours: Number(e.target.value) 
              }))}
              placeholder="24"
            />
          </div>

          {/* Preview */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium mb-1">תצוגה מקדימה:</p>
            <p className="text-xs text-muted-foreground">
              מחיר פתיחה: {formatCurrency(formData.starting_price)}
            </p>
            <p className="text-xs text-muted-foreground">
              הצעה הבאה: {formatCurrency(formData.starting_price + formData.min_increment)}
            </p>
            <p className="text-xs text-muted-foreground">
              יסתיים בעוד: {formData.duration_hours} שעות
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              ביטול
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  יוצר מכרז...
                </>
              ) : (
                <>
                  <Hammer className="h-4 w-4 ml-2" />
                  צור מכרז
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
