
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { OptimizedDiamondCard } from './OptimizedDiamondCard';
import { OptimizedDiamondCardSkeleton } from './OptimizedDiamondCardSkeleton';

interface VirtualizedStoreGridProps {
  diamonds: any[];
  isLoading: boolean;
  onDiamondClick: (diamond: any) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  containerHeight?: number;
}

const ITEM_HEIGHT = 320; // Height of each diamond card
const ITEMS_PER_ROW = 2; // Number of items per row

export function VirtualizedStoreGrid({
  diamonds,
  isLoading,
  onDiamondClick,
  onLoadMore,
  hasNextPage,
  containerHeight = 600
}: VirtualizedStoreGridProps) {
  // Group diamonds into rows
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < diamonds.length; i += ITEMS_PER_ROW) {
      result.push(diamonds.slice(i, i + ITEMS_PER_ROW));
    }
    
    // Add loading skeleton rows if needed
    if (isLoading) {
      const skeletonRows = Math.ceil(8 / ITEMS_PER_ROW); // Show 8 skeleton items
      for (let i = 0; i < skeletonRows; i++) {
        result.push(new Array(ITEMS_PER_ROW).fill({ isLoading: true }));
      }
    }
    
    return result;
  }, [diamonds, isLoading]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    const isLastRow = index === rows.length - 1;
    
    // Trigger load more when approaching the end
    if (isLastRow && hasNextPage && onLoadMore && !isLoading) {
      onLoadMore();
    }

    return (
      <div style={style} className="flex gap-4 px-4">
        {row.map((diamond: any, itemIndex: number) => (
          <div key={diamond.isLoading ? `skeleton-${index}-${itemIndex}` : diamond.id} className="flex-1">
            {diamond.isLoading ? (
              <OptimizedDiamondCardSkeleton />
            ) : (
              <OptimizedDiamondCard 
                diamond={diamond} 
                onClick={() => onDiamondClick(diamond)}
              />
            )}
          </div>
        ))}
        {/* Fill empty slots in the last row */}
        {row.length < ITEMS_PER_ROW && Array.from({ length: ITEMS_PER_ROW - row.length }).map((_, emptyIndex) => (
          <div key={`empty-${index}-${emptyIndex}`} className="flex-1" />
        ))}
      </div>
    );
  }, [rows, hasNextPage, onLoadMore, isLoading, onDiamondClick]);

  return (
    <div className="w-full">
      <List
        height={containerHeight}
        itemCount={rows.length}
        itemSize={ITEM_HEIGHT}
        overscanCount={2} // Render 2 extra rows above and below visible area
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {Row}
      </List>
    </div>
  );
}
