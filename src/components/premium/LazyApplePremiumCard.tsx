
import { lazy, Suspense } from "react";
import { PremiumSkeleton } from "@/components/ui/premium-skeleton";

// Lazy load the heavy ApplePremiumCard component
const ApplePremiumCard = lazy(() => import("./ApplePremiumCard").then(module => ({ default: module.ApplePremiumCard })));

interface LazyApplePremiumCardProps {
  diamond: any;
  index?: number;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function LazyApplePremiumCard(props: LazyApplePremiumCardProps) {
  return (
    <Suspense 
      fallback={
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="aspect-square relative overflow-hidden">
            <PremiumSkeleton className="w-full h-full" />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <PremiumSkeleton className="h-6 w-24" />
                <PremiumSkeleton className="h-4 w-16" />
              </div>
              <div className="text-right space-y-1">
                <PremiumSkeleton className="h-7 w-20" />
                <PremiumSkeleton className="h-3 w-14" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-slate-50/80 rounded-xl p-3 space-y-2">
                  <PremiumSkeleton className="h-3 w-12 mx-auto" />
                  <PremiumSkeleton className="h-4 w-8 mx-auto" />
                </div>
              ))}
            </div>
            <PremiumSkeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      }
    >
      <ApplePremiumCard {...props} />
    </Suspense>
  );
}
