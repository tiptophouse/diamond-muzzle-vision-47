import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, memo } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { TelegramDiamondCard } from './TelegramDiamondCard';

interface VirtualizedCatalogGridProps {
  diamonds: Diamond[];
  onViewDetails: (diamond: Diamond) => void;
}

export const VirtualizedCatalogGrid = memo(({ diamonds, onViewDetails }: VirtualizedCatalogGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate grid items (2 columns on mobile)
  const gridItems = [];
  for (let i = 0; i < diamonds.length; i += 2) {
    gridItems.push({
      left: diamonds[i],
      right: diamonds[i + 1]
    });
  }

  const virtualizer = useVirtualizer({
    count: gridItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated row height
    overscan: 2 // Render 2 extra rows above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className="h-full w-full overflow-auto"
      style={{
        contain: 'strict',
        height: '100%'
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = gridItems[virtualRow.index];
          
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div className="grid grid-cols-2 gap-3 px-4 py-2">
                {item.left && (
                  <TelegramDiamondCard
                    diamond={item.left}
                    index={virtualRow.index * 2}
                    onViewDetails={onViewDetails}
                  />
                )}
                {item.right && (
                  <TelegramDiamondCard
                    diamond={item.right}
                    index={virtualRow.index * 2 + 1}
                    onViewDetails={onViewDetails}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedCatalogGrid.displayName = 'VirtualizedCatalogGrid';
