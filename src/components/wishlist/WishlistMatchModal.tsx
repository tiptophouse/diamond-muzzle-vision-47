
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Diamond } from '@/components/inventory/InventoryTable';

interface WishlistMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchedDiamond: Diamond;
  uploaderInfo: {
    telegramId: number;
    firstName: string;
    username?: string;
  };
}

export function WishlistMatchModal({ 
  open, 
  onOpenChange, 
  matchedDiamond, 
  uploaderInfo 
}: WishlistMatchModalProps) {
  const { webApp } = useTelegramWebApp();

  const handleContactUploader = () => {
    if (webApp && uploaderInfo.username) {
      // Open Telegram chat with the uploader
      webApp.openTelegramLink(`https://t.me/${uploaderInfo.username}`);
    } else if (uploaderInfo.telegramId) {
      // Fallback: open Telegram with user ID
      window.open(`https://t.me/user?id=${uploaderInfo.telegramId}`, '_blank');
    }
  };

  const handleViewDiamond = () => {
    window.open(`/diamond/${matchedDiamond.stockNumber}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎉 Wishlist Match Found!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Diamond Image */}
          {matchedDiamond.imageUrl && (
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={matchedDiamond.imageUrl} 
                alt={`${matchedDiamond.shape} Diamond`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Diamond Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {matchedDiamond.carat}ct {matchedDiamond.shape}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{matchedDiamond.color}</Badge>
              <Badge variant="secondary">{matchedDiamond.clarity}</Badge>
              <Badge variant="secondary">{matchedDiamond.cut}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Stock: {matchedDiamond.stockNumber}
            </p>
            <p className="text-lg font-bold text-green-600">
              ${matchedDiamond.price?.toLocaleString()}
            </p>
          </div>

          {/* Uploader Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium">Uploaded by:</p>
            <p className="text-lg">{uploaderInfo.firstName}</p>
            {uploaderInfo.username && (
              <p className="text-sm text-gray-600">@{uploaderInfo.username}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleContactUploader}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Seller
            </Button>
            <Button 
              variant="outline"
              onClick={handleViewDiamond}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This diamond matches your wishlist preferences. Contact the seller directly through Telegram to discuss!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
