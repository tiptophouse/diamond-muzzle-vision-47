
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface WishlistButtonProps {
  diamond: Diamond;
  ownerTelegramId: number;
  className?: string;
}

export function WishlistButton({ diamond, ownerTelegramId, className = "" }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist: checkWishlist, isLoading } = useWishlist();
  const { user } = useTelegramAuth();
  const { impactOccurred } = useTelegramHapticFeedback();

  useEffect(() => {
    const checkIfInWishlist = async () => {
      if (user) {
        const inWishlist = await checkWishlist(diamond.stockNumber);
        setIsInWishlist(inWishlist);
      }
    };

    checkIfInWishlist();
  }, [diamond.stockNumber, user, checkWishlist]);

  const handleWishlistToggle = async () => {
    if (!user) return;

    impactOccurred('light');
    
    if (isInWishlist) {
      const success = await removeFromWishlist(diamond.stockNumber);
      if (success) {
        setIsInWishlist(false);
      }
    } else {
      const success = await addToWishlist(diamond, ownerTelegramId);
      if (success) {
        setIsInWishlist(true);
      }
    }
  };

  // Don't show wishlist button for own diamonds
  if (user?.id === ownerTelegramId) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`h-8 w-8 p-0 ${className}`}
    >
      <Heart 
        className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
      />
    </Button>
  );
}
