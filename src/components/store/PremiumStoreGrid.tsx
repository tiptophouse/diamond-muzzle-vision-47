
import { PremiumDiamondCard } from "./PremiumDiamondCard";
import { DiamondCardSkeleton } from "./DiamondCardSkeleton";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle, Gem, Sparkles } from "lucide-react";

interface PremiumStoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
}

export function PremiumStoreGrid({ diamonds, loading, error, onUpdate }: PremiumStoreGridProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="text-center py-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Loading Premium Collection</h3>
          <p className="text-slate-600">Discovering exceptional diamonds for you...</p>
        </div>
        
        {/* Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }, (_, i) => (
            <DiamondCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Unable to Load Collection</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-br from-slate-400 to-slate-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Gem className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">No Diamonds Found</h3>
          <p className="text-slate-600 mb-4">
            We couldn't find any diamonds matching your criteria. Try adjusting your filters to discover more exceptional stones.
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-8">
      {/* Collection Stats */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Exceptional Diamond Collection
        </h2>
        <p className="text-slate-600">
          Discover {diamonds.length} carefully curated, certified diamonds from our premium selection
        </p>
      </div>

      {/* Premium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {diamonds.map((diamond, index) => (
          <PremiumDiamondCard 
            key={diamond.id} 
            diamond={diamond} 
            index={index}
            onUpdate={onUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Collection Footer */}
      <div className="text-center py-8 border-t border-slate-200">
        <div className="flex justify-center items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Certified Authentic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Expert Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Premium Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
}
