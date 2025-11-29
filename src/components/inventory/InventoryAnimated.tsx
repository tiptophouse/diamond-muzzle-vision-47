import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface InventoryCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function InventoryCard({ children, className, index = 0 }: InventoryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        duration: 0.4,
        delay: index * 0.05,
        bounce: 0.3
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

export function InventoryLoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 p-4 bg-card rounded-lg border"
    >
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 bg-gradient-to-br from-muted via-muted/50 to-muted rounded-lg animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-shimmer" />
          <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-2/3 animate-shimmer" />
        </div>
      </div>
    </motion.div>
  );
}
