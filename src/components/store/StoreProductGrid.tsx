
import { StoreProductCard } from "./StoreProductCard";
import { Card, CardContent } from "@/components/ui/card";

interface StoreProductGridProps {
  diamonds: any[];
  loading: boolean;
  error: string | null;
  onDiamondClick: (diamond: any) => void;
}

export function StoreProductGrid({ diamonds, loading, error, onDiamondClick }: StoreProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load diamonds</h3>
          <p className="text-gray-600">Please try again later or contact our support team.</p>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No diamonds found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more options.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {diamonds.map((diamond, index) => (
        <StoreProductCard
          key={diamond.id || index}
          diamond={diamond}
          onClick={() => onDiamondClick(diamond)}
        />
      ))}
    </div>
  );
}
