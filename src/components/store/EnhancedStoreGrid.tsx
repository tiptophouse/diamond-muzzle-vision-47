import React from 'react';
import { OptimizedDiamondCard } from './OptimizedDiamondCard';
import { Diamond } from '@/types/diamond';

interface EnhancedStoreGridProps {
  diamonds: Diamond[];
  onUpdate: () => void;
}

export function EnhancedStoreGrid({ diamonds, onUpdate }: EnhancedStoreGridProps) {
  if (!diamonds) {
    return <p>No diamonds available.</p>;
  }

  if (diamonds.length === 0) {
    return <p>No diamonds found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {diamonds.map((diamond) => (
        <OptimizedDiamondCard
          key={diamond.id}
          diamond={diamond}
          onAddToWishlist={(d) => console.log('Add to wishlist:', d)}
          onShare={(d) => console.log('Share diamond:', d)}
          onViewDetails={(d) => console.log('View details:', d)}
        />
      ))}
      {onUpdate && (
        <button onClick={onUpdate} className="hidden">
          Update
        </button>
      )}
    </div>
  );
}
