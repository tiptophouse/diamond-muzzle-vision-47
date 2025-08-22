import React from 'react';
import { DiamondCard } from './DiamondCard';
import { Diamond } from '@/types/diamond';

interface StoreGridProps {
  diamonds: Diamond[];
  onAddToWishlist?: (diamond: Diamond) => void;
  onShare?: (diamond: Diamond) => void;
  onViewDetails?: (diamond: Diamond) => void;
}

export function StoreGrid({ diamonds, onAddToWishlist, onShare, onViewDetails }: StoreGridProps) {
  if (!diamonds || diamonds.length === 0) {
    return <p className="text-center text-muted-foreground p-4">No diamonds found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {diamonds.map((diamond) => (
        <DiamondCard
          key={diamond.id}
          diamond={diamond}
          onAddToWishlist={onAddToWishlist}
          onShare={onShare}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
