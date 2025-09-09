import { memo, useMemo, useState, useCallback } from "react";
import { OptimizedDiamondCard } from "./OptimizedDiamondCard";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginatedStoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
}

const ITEMS_PER_PAGE = 50; // Show 50 diamonds per page for performance

export function PaginatedStoreGrid({ diamonds, loading, error, onUpdate }: PaginatedStoreGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { paginatedDiamonds, totalPages, startIndex, endIndex } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, diamonds.length);
    const paginatedDiamonds = diamonds.slice(startIndex, endIndex);
    const totalPages = Math.ceil(diamonds.length / ITEMS_PER_PAGE);
    
    return {
      paginatedDiamonds,
      totalPages,
      startIndex,
      endIndex
    };
  }, [diamonds, currentPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Loading diamonds with performance optimization...
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Diamonds</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 bg-muted-foreground/20 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium mb-2">No Diamonds Found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters to see more diamonds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance indicator for large datasets */}
      {diamonds.length > 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-1">
            ⚡ Performance Mode Active
          </h4>
          <p className="text-xs text-green-700">
            Showing {ITEMS_PER_PAGE} diamonds per page for optimal performance. 
            Total: {diamonds.length} diamonds
          </p>
        </div>
      )}

      {/* Page info */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Showing {startIndex + 1}-{endIndex} of {diamonds.length} diamonds
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>
      
      {/* Diamond Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {paginatedDiamonds.map((diamond, index) => (
          <OptimizedDiamondCard 
            key={diamond.id} 
            diamond={diamond}
            index={startIndex + index} // Use global index for proper loading delays
            onUpdate={onUpdate}
          />
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                // Show pages around current page
                const start = Math.max(1, currentPage - 2);
                const end = Math.min(totalPages, start + 4);
                pageNum = start + i;
                if (pageNum > end) return null;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Bottom page info */}
      <div className="text-center text-xs text-muted-foreground">
        {diamonds.length > ITEMS_PER_PAGE && (
          <>Pagination active for better performance • {diamonds.length} total diamonds</>
        )}
      </div>
    </div>
  );
}