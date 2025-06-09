
import { Sparkles, Gem, Crown } from "lucide-react";
import { DiamondCardSkeleton } from "@/components/ui/premium-skeleton";

interface PremiumLoadingGridProps {
  title?: string;
  subtitle?: string;
  itemCount?: number;
}

export function PremiumLoadingGrid({ 
  title = "Loading Premium Collection", 
  subtitle = "Discovering exceptional diamonds for you...",
  itemCount = 12 
}: PremiumLoadingGridProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Loading Header */}
      <div className="text-center py-12">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl">
            <Sparkles className="h-10 w-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
          {title}
        </h3>
        <p className="text-slate-600 max-w-md mx-auto leading-relaxed">{subtitle}</p>
        
        {/* Elegant progress indicator */}
        <div className="flex justify-center mt-6 space-x-1">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Premium Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {Array.from({ length: itemCount }, (_, i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 50}ms` }}
            className="animate-fade-in"
          >
            <DiamondCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PremiumInventoryLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-blue-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-emerald-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <Gem className="h-8 w-8 text-white animate-bounce" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Loading Your Inventory</h3>
          <p className="text-slate-600">Fetching your diamond collection...</p>
        </div>
      </div>
    </div>
  );
}

export function PremiumUploadLoading({ progress = 0 }: { progress?: number }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl">
            <Crown className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Processing Your Diamonds</h3>
        <p className="text-slate-600 mb-6">Adding premium quality diamonds to your collection...</p>
        
        {/* Premium progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 mt-2">{progress}% complete</p>
      </div>
    </div>
  );
}
