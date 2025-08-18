
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Share2, Send, User, Sparkles } from 'lucide-react';
import { Diamond } from '@/types/diamond';
import { useTelegramDiamondShare } from '@/hooks/useTelegramDiamondShare';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TelegramInlineShareButtonProps {
  diamond: Diamond;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function TelegramInlineShareButton({ 
  diamond, 
  variant = 'default',
  size = 'default',
  className 
}: TelegramInlineShareButtonProps) {
  const { shareDiamondWithInlineKeyboard, isAvailable } = useTelegramDiamondShare();
  const { user } = useTelegramWebApp();
  const [recipientName, setRecipientName] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareDiamondWithInlineKeyboard(diamond);
      if (success) {
        setIsOpen(false);
        setRecipientName('');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleQuickShare = async () => {
    setIsSharing(true);
    try {
      await shareDiamondWithInlineKeyboard(diamond);
    } finally {
      setIsSharing(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={!isAvailable}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share via Telegram
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader className="text-center">
          <SheetTitle className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Share Diamond via Telegram
          </SheetTitle>
          <SheetDescription>
            Send this diamond with interactive buttons directly to someone's Telegram
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Diamond Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-semibold">
                {diamond.carat}ct {diamond.shape} Diamond
              </span>
            </div>
            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
              <span>Color: {diamond.color}</span>
              <span>Clarity: {diamond.clarity}</span>
              <span>Stock: {diamond.stock_number}</span>
              <span>Price: ${diamond.price?.toLocaleString()}</span>
            </div>
          </div>

          {/* Recipient Name Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Recipient Name (Optional)
            </Label>
            <Input
              id="recipient"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Nick, Sarah, etc."
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Adding a name personalizes the message
            </p>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1"
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share with Buttons'}
            </Button>
            
            <Button 
              onClick={handleQuickShare}
              variant="outline"
              disabled={isSharing}
              size="lg"
            >
              Quick Share
            </Button>
          </div>

          {/* Feature Highlight */}
          <div className="text-center text-xs text-muted-foreground bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-700">Professional Features</span>
            </div>
            Recipients get interactive buttons to view diamond, contact you, and share with others
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
