
import { LuxuryProductCard } from "./LuxuryProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface LuxuryProductGridProps {
  diamonds: any[];
  loading: boolean;
  error: string | null;
  onDiamondClick: (diamond: any) => void;
  onPurchaseClick: (diamond: any) => void;
}

export function LuxuryProductGrid({ 
  diamonds, 
  loading, 
  error, 
  onDiamondClick, 
  onPurchaseClick 
}: LuxuryProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to Load Collection</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Diamonds Found</h3>
          <p className="text-slate-600">Try adjusting your filters to see more options.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {diamonds.map((diamond) => (
        <LuxuryProductCard
          key={diamond.id}
          diamond={diamond}
          onClick={() => onDiamondClick(diamond)}
          onPurchaseClick={() => onPurchaseClick(diamond)}
        />
      ))}
    </div>
  );
}
