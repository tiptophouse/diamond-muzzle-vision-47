import { useState, useEffect, useMemo } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface VirtualListOptions {
  itemHeight: number;
  itemsPerRow: number;
  containerHeight: number;
  overscan?: number;
}

export function useTelegramVirtualList<T>(
  items: T[],
  options: VirtualListOptions
) {
  const { webApp } = useTelegramWebApp();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [viewportHeight, setViewportHeight] = useState(options.containerHeight);

  // Update viewport height when Telegram viewport changes
  useEffect(() => {
    if (!webApp) return;

    const updateViewport = () => {
      const height = webApp.viewportHeight - 120; // Account for header/nav
      setViewportHeight(Math.max(300, height));
    };

    updateViewport();
    webApp.onEvent('viewportChanged', updateViewport);

    return () => {
      webApp.offEvent('viewportChanged', updateViewport);
    };
  }, [webApp]);

  // Group items into rows for grid layout
  const rowData = useMemo(() => {
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += options.itemsPerRow) {
      rows.push(items.slice(i, i + options.itemsPerRow));
    }
    return rows;
  }, [items, options.itemsPerRow]);

  const rowCount = rowData.length;

  return {
    containerRef,
    setContainerRef,
    viewportHeight,
    rowData,
    rowCount,
    itemHeight: options.itemHeight,
    overscan: options.overscan || 3
  };
}