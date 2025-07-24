
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { toast } from 'sonner';

interface WishlistButtonProps {
  diamond: Diamond;
  ownerTelegramId: number;
  className?: string;
}

export function WishlistButton({ diamond, ownerTelegramId, className = "" }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist: checkWishlist } = useWishlist();
  const { user } = useTelegramAuth();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

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
    if (!user) {
      toast.error('Please sign in to use wishlist');
      return;
    }

    setIsLoading(true);
    impactOccurred('light');
    
    try {
      if (isInWishlist) {
        const success = await removeFromWishlist(diamond.stockNumber);
        if (success) {
          setIsInWishlist(false);
          notificationOccurred('success');
          toast.success('Removed from wishlist');
        }
      } else {
        const success = await addToWishlist(diamond, ownerTelegramId);
        if (success) {
          setIsInWishlist(true);
          notificationOccurred('success');
          toast.success('Added to wishlist! Owner has been notified.');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
      notificationOccurred('error');
    } finally {
      setIsLoading(false);
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
      className={`h-8 w-8 p-0 relative ${className}`}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-300 ${
          isInWishlist 
            ? 'fill-red-500 text-red-500 scale-110' 
            : 'text-muted-foreground hover:text-red-500 hover:scale-110'
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </Button>
  );
}
