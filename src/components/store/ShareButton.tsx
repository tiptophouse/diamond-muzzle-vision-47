
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { Diamond } from '@/components/inventory/InventoryTable';

interface ShareButtonProps {
  stockNumber: string;
  onShare?: () => void;
}

export function ShareButton({ stockNumber, onShare }: ShareButtonProps) {
  const handleShare = () => {
    // Share functionality
    const shareUrl = `${window.location.origin}/diamond/${stockNumber}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Diamond ${stockNumber}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
    
    onShare?.();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="flex items-center gap-2"
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}
