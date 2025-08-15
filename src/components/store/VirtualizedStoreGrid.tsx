
import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { OptimizedDiamondCard } from './OptimizedDiamondCard';
import { Diamond } from '@/types/diamond';
import OptimizedDiamondCardSkeleton from './OptimizedDiamondCardSkeleton';

interface VirtualizedStoreGridProps {
  diamonds: Diamond[];
  isLoading: boolean;
  onDiamondClick: (diamond: Diamond) => void;
}

export function VirtualizedStoreGrid({ diamonds, isLoading, onDiamondClick }: VirtualizedStoreGridProps) {
  const CARD_WIDTH = 320;
  const CARD_HEIGHT = 450;
  const GAP = 16;

  const gridDimensions = useMemo(() => {
    const containerWidth = window.innerWidth - 32; // Account for padding
    const columnsCount = Math.floor(containerWidth / (CARD_WIDTH + GAP));
    const actualColumnCount = Math.max(1, columnsCount);
    const rowCount = Math.ceil(diamonds.length / actualColumnCount);
    
    return {
      columnCount: actualColumnCount,
      rowCount,
      width: containerWidth,
      height: Math.min(window.innerHeight - 200, rowCount * (CARD_HEIGHT + GAP))
    };
  }, [diamonds.length]);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * gridDimensions.columnCount + columnIndex;
    const diamond = diamonds[index];

    if (!diamond) {
      return null;
    }

    return (
      <div
        style={{
          ...style,
          padding: GAP / 2,
        }}
      >
        {isLoading ? (
          <OptimizedDiamondCardSkeleton />
        ) : (
          <OptimizedDiamondCard
            diamond={diamond}
            onDiamondClick={onDiamondClick}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <OptimizedDiamondCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Grid
        columnCount={gridDimensions.columnCount}
        columnWidth={CARD_WIDTH + GAP}
        height={gridDimensions.height}
        rowCount={gridDimensions.rowCount}
        rowHeight={CARD_HEIGHT + GAP}
        width={gridDimensions.width}
      >
        {Cell}
      </Grid>
    </div>
  );
}
