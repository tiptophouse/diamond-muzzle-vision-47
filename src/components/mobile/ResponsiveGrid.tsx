import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "gap-4",
  className 
}: ResponsiveGridProps) {
  const gridCols = cn(
    "grid",
    gap,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <div className={gridCols}>
      {children}
    </div>
  );
}

// Specific grid configurations for common use cases
export function MobileStatsGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 2, md: 4 }}
      gap="gap-3"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function MobileCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 1, sm: 2, lg: 3 }}
      gap="gap-4"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function MobileDiamondGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 2, sm: 3, md: 4, lg: 5 }}
      gap="gap-3"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}