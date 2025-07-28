
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/components/inventory/InventoryTable';

interface WishlistButtonProps {
  diamond: Diamond;
  onUpdate?: () => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

export function WishlistButton({ 
  diamond, 
  onUpdate, 
  className = "",
  size = "default",
  variant = "ghost",
  showText = false
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { addToWishlist, removeFromWishlist, checkIsInWishlist } = useWishlist();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useTelegramAuth();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user?.id) {
        const inWishlist = await checkIsInWishlist(diamond.stockNumber);
        setIsInWishlist(inWishlist);
      }
    };
    checkWishlistStatus();
  }, [diamond.stockNumber, checkIsInWishlist, user?.id]);

  const handleWishlistToggle = async () => {
    if (!user?.id) return;
    
    hapticFeedback.impact('medium');
    
    if (isInWishlist) {
      const success = await removeFromWishlist(diamond.stockNumber);
      if (success) {
        setIsInWishlist(false);
        onUpdate?.();
      }
    } else {
      const success = await addToWishlist(diamond, user.id);
      if (success) {
        setIsInWishlist(true);
        onUpdate?.();
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWishlistToggle}
      className={`transition-all duration-200 ${className} ${
        isInWishlist 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
      }`}
    >
      <Heart 
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${
          isInWishlist ? 'fill-current' : ''
        } ${showText ? 'mr-2' : ''}`}
      />
      {showText && (
        <span className="text-xs">
          {isInWishlist ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        </span>
      )}
    </Button>
  );
}
