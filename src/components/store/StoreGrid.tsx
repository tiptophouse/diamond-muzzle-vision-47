
import { ProfessionalDiamondCard } from "./ProfessionalDiamondCard";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }, (_, i) => (
          <DiamondCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Diamonds</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Diamonds Found</h3>
          <p className="text-slate-600">Try adjusting your filters to see more diamonds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {diamonds.map((diamond) => (
        <ProfessionalDiamondCard 
          key={diamond.id} 
          diamond={diamond}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
