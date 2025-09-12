import { memo, useState, useEffect, useRef } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { TelegramDiamondCardCompact } from './TelegramDiamondCardCompact';
import { useTelegramVirtualList } from '@/hooks/useTelegramVirtualList';

interface TelegramVirtualGridProps {
  diamonds: Diamond[];
  onViewDetails: (diamond: Diamond) => void;
  onContact: (diamond: Diamond) => void;
  loading?: boolean;
}

export const TelegramVirtualGrid = memo(function TelegramVirtualGrid({
  diamonds,
  onViewDetails,
  onContact,
  loading = false
}: TelegramVirtualGridProps) {
  const {
    containerRef,
    setContainerRef,
    viewportHeight,
    rowData,
    itemHeight
  } = useTelegramVirtualList(diamonds, {
    itemHeight: 220, // Height of each row (card height + spacing)
    itemsPerRow: 2,
    containerHeight: 600,
    overscan: 3
  });

  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const handleScroll = () => {
      setScrollTop(element.scrollTop);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💎</span>
          </div>
          <h3 className="font-medium mb-2" style={{ color: 'var(--tg-text)' }}>
            No diamonds found
          </h3>
          <p className="text-sm" style={{ color: 'var(--tg-hint)' }}>
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  // Simple virtualization - show only visible rows
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(viewportHeight / itemHeight) + 2,
    rowData.length
  );
  const visibleRows = rowData.slice(startIndex, endIndex);

  return (
    <div ref={setContainerRef} className="flex-1" style={{ height: viewportHeight }}>
      <div
        ref={scrollElementRef}
        className="h-full overflow-y-auto telegram-virtual-grid"
        style={{ height: viewportHeight }}
      >
        {/* Spacer for items above viewport */}
        <div style={{ height: startIndex * itemHeight }} />
        
        {/* Visible rows */}
        {visibleRows.map((rowItems, virtualIndex) => {
          const actualIndex = startIndex + virtualIndex;
          return (
            <div key={actualIndex} className="px-4">
              <div className="grid grid-cols-2 gap-3 py-1.5" style={{ height: itemHeight }}>
                {rowItems.map((diamond, itemIndex) => (
                  <div key={diamond.id || `${actualIndex}-${itemIndex}`}>
                    <TelegramDiamondCardCompact
                      diamond={diamond}
                      onViewDetails={onViewDetails}
                      onContact={onContact}
                    />
                  </div>
                ))}
                {/* Fill empty slots to maintain grid */}
                {rowItems.length === 1 && <div />}
              </div>
            </div>
          );
        })}
        
        {/* Spacer for items below viewport */}
        <div style={{ height: (rowData.length - endIndex) * itemHeight }} />
      </div>
    </div>
  );
});