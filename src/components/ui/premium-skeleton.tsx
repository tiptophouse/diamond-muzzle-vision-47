
import { cn } from "@/lib/utils"

function PremiumSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-slate-200/60 via-slate-100/40 to-slate-200/60 bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
        className
      )}
      {...props}
    />
  )
}

function DiamondCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden group">
      <div className="aspect-square relative overflow-hidden">
        <PremiumSkeleton className="w-full h-full" />
        <div className="absolute top-4 left-4">
          <PremiumSkeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="absolute top-4 right-4">
          <PremiumSkeleton className="h-8 w-8 rounded-full" />
        </div>
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
        
        <div className="pt-2">
          <PremiumSkeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export { PremiumSkeleton, DiamondCardSkeleton }
