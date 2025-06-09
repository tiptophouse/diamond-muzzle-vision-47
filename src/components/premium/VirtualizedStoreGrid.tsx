
import { memo, useState, useCallback, useMemo } from "react";
import { LazyApplePremiumCard } from "./LazyApplePremiumCard";
import { PremiumLoadingGrid } from "./PremiumLoadingStates";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle, Gem, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VirtualizedStoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
}

const ITEMS_PER_PAGE = 12; // Show 12 diamonds per page for optimal performance

export const VirtualizedStoreGrid = memo(function VirtualizedStoreGrid({ 
  diamonds, 
  loading, 
  error, 
  onUpdate 
}: VirtualizedStoreGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize expensive calculations
  const { sortedDiamonds, stats, totalPages, paginatedDiamonds } = useMemo(() => {
    const sorted = [...diamonds].sort((a, b) => {
      // Sort by status (Available first), then by price
      if (a.status !== b.status) {
        return a.status === 'Available' ? -1 : 1;
      }
      return b.price - a.price;
    });

    const available = diamonds.filter(d => d.status === 'Available').length;
    const avgPrice = diamonds.length > 0 
      ? Math.round(diamonds.reduce((sum, d) => sum + d.price, 0) / diamonds.length)
      : 0;

    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedDiamonds = sorted.slice(startIndex, endIndex);

    return {
      sortedDiamonds: sorted,
      stats: { available, avgPrice, total: diamonds.length },
      totalPages,
      paginatedDiamonds
    };
  }, [diamonds, currentPage]);

  const handleDelete = useCallback(() => {
    if (onUpdate) {
      onUpdate();
    }
    // Reset to page 1 if current page becomes empty
    if (paginatedDiamonds.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [onUpdate, paginatedDiamonds.length, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <PremiumLoadingGrid 
        title="Loading Premium Collection"
        subtitle="Discovering exceptional diamonds for you..."
        itemCount={ITEMS_PER_PAGE}
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Unable to Load Collection</h3>
          <p className="text-slate-600 mb-4 leading-relaxed">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (sortedDiamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-br from-slate-400 to-slate-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Gem className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">No Diamonds Found</h3>
          <p className="text-slate-600 mb-4 leading-relaxed">
            We couldn't find any diamonds matching your criteria. Try adjusting your filters to discover more exceptional stones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Collection header with stats */}
      <div className="text-center py-8">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-xl"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Exceptional Diamond Collection
        </h2>
        <p className="text-slate-600 mb-4">
          Discover {stats.total} carefully curated, certified diamonds from our premium selection
        </p>
        
        {/* Quick stats */}
        <div className="flex justify-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{stats.available} Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Avg ${stats.avgPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Optimized virtualized grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {paginatedDiamonds.map((diamond, index) => (
          <LazyApplePremiumCard 
            key={`${diamond.id}-${currentPage}`} 
            diamond={diamond} 
            index={index}
            onUpdate={onUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={pageNum === currentPage ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Collection footer */}
      <div className="text-center py-8 border-t border-slate-200/60">
        <div className="flex justify-center items-center gap-8 text-sm text-slate-600">
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
});
