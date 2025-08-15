
import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { OptimizedDiamondCard } from './OptimizedDiamondCard';
import { Diamond } from '@/types/diamond';

interface VirtualizedStoreGridProps {
  diamonds: Diamond[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export function VirtualizedStoreGrid({
  diamonds,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight
}: VirtualizedStoreGridProps) {
  const columnCount = Math.floor(containerWidth / itemWidth) || 1;
  const rowCount = Math.ceil(diamonds.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const diamond = diamonds[index];

    if (!diamond) return null;

    return (
      <div style={style}>
        <div className="p-2">
          <OptimizedDiamondCard diamond={diamond} />
        </div>
      </div>
    );
  };

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={itemWidth}
      height={containerHeight}
      rowCount={rowCount}
      rowHeight={itemHeight}
      width={containerWidth}
    >
      {Cell}
    </Grid>
  );
}
