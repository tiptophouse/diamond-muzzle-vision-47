
import { ModernDiamondCard } from "./ModernDiamondCard";
import { DiamondCardSkeleton } from "./DiamondCardSkeleton";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle } from "lucide-react";

interface StoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
}

export function StoreGrid({ diamonds, loading, error, onUpdate }: StoreGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 12 }, (_, i) => (
          <DiamondCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Diamonds</h3>
          <p className="text-sm sm:text-base text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Diamonds Found</h3>
          <p className="text-sm sm:text-base text-slate-600">Try adjusting your filters to see more diamonds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
      {diamonds.map((diamond, index) => (
        <ModernDiamondCard 
          key={diamond.id} 
          diamond={diamond}
          index={index}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
