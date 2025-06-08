
import { Skeleton } from "@/components/ui/skeleton";

export function DiamondCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="h-48 w-full" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-32" />
        
        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-10 mx-auto" />
            <Skeleton className="h-5 w-8 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-10 mx-auto" />
            <Skeleton className="h-5 w-8 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-10 mx-auto" />
            <Skeleton className="h-5 w-8 mx-auto" />
          </div>
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
