import { memo, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { FigmaDiamondCard } from "./FigmaDiamondCard";
import OptimizedDiamondCardSkeleton from "./OptimizedDiamondCardSkeleton";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle, Search } from "lucide-react";

interface VirtualizedStoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error: string | null;
  onUpdate?: () => void;
}

const ITEM_HEIGHT = 420; // Height per diamond card including gaps
const ITEMS_PER_ROW = 2; // 2 columns for mobile/tablet

const VirtualizedStoreGrid = memo(({ diamonds, loading, error, onUpdate }: VirtualizedStoreGridProps) => {
  // Calculate rows needed for 2-column layout
  const rowCount = Math.ceil(diamonds.length / ITEMS_PER_ROW);
  
  // Get window height for virtualization
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight - 200 : 600;

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const startIndex = index * ITEMS_PER_ROW;
    const endIndex = Math.min(startIndex + ITEMS_PER_ROW, diamonds.length);
    const rowDiamonds = diamonds.slice(startIndex, endIndex);

    return (
      <div style={style} className="flex gap-4 px-4">
        {rowDiamonds.map((diamond, cellIndex) => (
          <div key={diamond.id} className="flex-1">
            <FigmaDiamondCard 
              diamond={diamond}
              index={startIndex + cellIndex}
              onUpdate={onUpdate}
            />
          </div>
        ))}
        {/* Fill empty cells to maintain layout */}
        {rowDiamonds.length < ITEMS_PER_ROW && (
          <div className="flex-1" />
        )}
      </div>
    );
  }, [diamonds, onUpdate]);

  const MemoizedRow = memo(Row);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 px-4">
        {Array.from({ length: 6 }, (_, i) => (
          <OptimizedDiamondCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Diamonds</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Diamonds Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more diamonds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <List
        height={windowHeight}
        itemCount={rowCount}
        itemSize={ITEM_HEIGHT}
        width="100%"
        overscanCount={2} // Render 2 extra rows for smooth scrolling
      >
        {MemoizedRow}
      </List>
    </div>
  );
});

VirtualizedStoreGrid.displayName = "VirtualizedStoreGrid";

export { VirtualizedStoreGrid };