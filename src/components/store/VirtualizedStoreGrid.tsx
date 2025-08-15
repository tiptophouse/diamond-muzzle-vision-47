
import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { DiamondCard } from './DiamondCard';
import { DiamondCardSkeleton } from './DiamondCardSkeleton';

// Use local Diamond type instead of importing
interface Diamond {
  id: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat?: number;
  picture?: string;
  certificate_url?: string;
  store_visible?: boolean;
}

interface VirtualizedStoreGridProps {
  diamonds: Diamond[];
  isLoading?: boolean;
  onDiamondSelect?: (diamond: Diamond) => void;
  itemsPerRow?: number;
  itemHeight?: number;
  containerHeight?: number;
}

export function VirtualizedStoreGrid({
  diamonds,
  isLoading = false,
  onDiamondSelect,
  itemsPerRow = 2,
  itemHeight = 300,
  containerHeight = 600
}: VirtualizedStoreGridProps) {
  const gridData = useMemo(() => {
    const rows = Math.ceil(diamonds.length / itemsPerRow);
    return { diamonds, rows, itemsPerRow };
  }, [diamonds, itemsPerRow]);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const itemIndex = rowIndex * itemsPerRow + columnIndex;
    const diamond = diamonds[itemIndex];

    if (!diamond) {
      return <div style={style} />;
    }

    if (isLoading) {
      return (
        <div style={{ ...style, padding: '8px' }}>
          <DiamondCardSkeleton />
        </div>
      );
    }

    return (
      <div style={{ ...style, padding: '8px' }}>
        <DiamondCard
          diamond={diamond}
          onClick={() => onDiamondSelect?.(diamond)}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <DiamondCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">לא נמצאו יהלומים</p>
      </div>
    );
  }

  return (
    <Grid
      columnCount={itemsPerRow}
      columnWidth={window.innerWidth / itemsPerRow - 16}
      height={containerHeight}
      rowCount={gridData.rows}
      rowHeight={itemHeight}
      width="100%"
      itemData={gridData}
    >
      {Cell}
    </Grid>
  );
}
