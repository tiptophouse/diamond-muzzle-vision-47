import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Share2, Send, Sparkles, User, Gem } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";

interface TelegramInlineShareButtonProps {
  diamond: Diamond;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function TelegramInlineShareButton({ diamond, variant = "default", size = "default", className }: TelegramInlineShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const { shareWithInlineButtons } = useSecureDiamondSharing();

  const shareDiamondWithInlineKeyboard = async (diamond: Diamond): Promise<boolean> => {
    if (!diamond) {
      console.error('No diamond data provided for sharing.');
      return false;
    }

    try {
      return await shareWithInlineButtons(diamond);
    } catch (error) {
      console.error('Error sharing diamond:', error);
      return false;
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareDiamondWithInlineKeyboard(diamond);
      if (success) {
        setIsOpen(false);
        setRecipientName('');
      }
    } catch (error) {
      console.error('Failed to share diamond:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!diamond) {
    return (
      <Button variant="ghost" disabled>
        <Share2 className="h-4 w-4 mr-2" />
        Share via Telegram
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share via Telegram
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Share Diamond via Telegram
          </SheetTitle>
          <SheetDescription>
            Send this diamond with interactive buttons to contacts or groups
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Diamond Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-blue-200">
                <Gem className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {diamond.carat}ct {diamond.shape} Diamond
                </h3>
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                  <span>Color: {diamond.color}</span>
                  <span>Clarity: {diamond.clarity}</span>
                  <span>Stock: {diamond.stockNumber}</span>
                  <span>Price: ${diamond.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Recipient Name (Optional)
            </Label>
            <Input
              id="recipient"
              placeholder="Enter contact or group name..."
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to share without specific recipient
            </p>
          </div>

          {/* Share Button */}
          <Button 
            onClick={handleShare} 
            disabled={isSharing}
            className="w-full"
            size="lg"
          >
            {isSharing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sharing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Share Diamond
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground bg-slate-50 rounded-lg p-3">
            <p className="font-medium mb-1">🔒 Secure Sharing</p>
            <p>Only registered users in your Telegram network can view this diamond</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
