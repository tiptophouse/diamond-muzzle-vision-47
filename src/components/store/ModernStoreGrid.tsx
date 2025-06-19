
import { ModernDiamondCard } from "./ModernDiamondCard";
import { DiamondCardSkeleton } from "./DiamondCardSkeleton";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle, Sparkles } from "lucide-react";

interface ModernStoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
  storeOwnerId?: number;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function ModernStoreGrid({ 
  diamonds, 
  loading, 
  error, 
  onUpdate, 
  storeOwnerId,
  removeDiamondFromState,
  restoreDiamondToState
}: ModernStoreGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
        {Array.from({ length: 12 }, (_, i) => (
          <DiamondCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Error Loading Diamonds</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">No Diamonds Found</h3>
          <p className="text-slate-600 mb-6">Try adjusting your filters to discover more beautiful diamonds.</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-slate-600">
              💡 <strong>Tip:</strong> Use the search and filter options above to find diamonds that match your preferences.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600 font-medium">
          Showing <span className="text-blue-600 font-bold">{diamonds.length}</span> premium diamonds
        </p>
        <div className="text-sm text-slate-500">
          Updated just now
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
        {diamonds.map((diamond, index) => (
          <div 
            key={diamond.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ModernDiamondCard 
              diamond={diamond}
              onUpdate={onUpdate}
              storeOwnerId={storeOwnerId}
              removeDiamondFromState={removeDiamondFromState}
              restoreDiamondToState={restoreDiamondToState}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
