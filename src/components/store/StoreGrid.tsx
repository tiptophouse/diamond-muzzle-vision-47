
import { useState } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { EnhancedDiamondCard } from "./EnhancedDiamondCard";
import { DiamondCardSkeleton } from "./DiamondCardSkeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Gem } from "lucide-react";

interface StoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export function StoreGrid({ diamonds, loading, error, onRefresh }: StoreGridProps) {
  const [animationDelay, setAnimationDelay] = useState(0);

  const handleRefresh = () => {
    setAnimationDelay(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="border-red-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
        {Array.from({ length: 8 }).map((_, index) => (
          <DiamondCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="max-w-md mx-auto">
          <Gem className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No diamonds available</h3>
          <p className="text-gray-600 mb-6">
            The store inventory is currently empty. Please check back later.
          </p>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {diamonds.length} diamonds
        </p>
        <Button 
          onClick={handleRefresh} 
          variant="ghost" 
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {diamonds.map((diamond, index) => (
          <div
            key={diamond.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            <EnhancedDiamondCard
              diamond={diamond}
              index={index}
              onUpdate={handleRefresh}
              onDelete={handleRefresh}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
