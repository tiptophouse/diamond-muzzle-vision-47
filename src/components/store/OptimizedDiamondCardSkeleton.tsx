import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function OptimizedDiamondCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Price */}
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-20 ml-2" />
        </div>
        
        {/* Specs */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-6 w-16" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

export default memo(OptimizedDiamondCardSkeleton);