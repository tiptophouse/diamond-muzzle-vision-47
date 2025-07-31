
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { OptimizedDiamondCard } from "@/components/store/OptimizedDiamondCard";
import { DiamondCardSkeleton } from "@/components/store/DiamondCardSkeleton";
import { EnhancedStoreHeader } from "@/components/store/EnhancedStoreHeader";
import { TelegramStoreFilters } from "@/components/store/TelegramStoreFilters";
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import { Button } from "@/components/ui/button";
import { ChevronUp, RefreshCw } from "lucide-react";

const tg = getTelegramWebApp();

// Reduced items per page for better performance
const ITEMS_PER_PAGE = 6;

function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Complete filters that match TelegramStoreFilters interface
  const defaultFilters = {
    shapes: [] as string[],
    colors: [] as string[],
    clarities: [] as string[],
    cuts: [] as string[],
    fluorescence: [] as string[],
    polish: [] as string[],
    symmetry: [] as string[],
    caratRange: [0, 10] as [number, number],
    priceRange: [0, 100000] as [number, number],
    depthRange: [0, 100] as [number, number],
    tableRange: [0, 100] as [number, number]
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [sortOption, setSortOption] = useState("price_asc");
  const [searchQuery, setSearchQuery] = useState("");

  const { filteredDiamonds } = useStoreFilters(diamonds, filters, searchQuery, sortOption);

  // Prioritize diamonds with images first, then apply sorting
  const sortedDiamonds = useMemo(() => {
    if (!filteredDiamonds) return [];
    
    // First separate diamonds with and without images
    const withImages = filteredDiamonds.filter(d => d.imageUrl && d.imageUrl.trim());
    const withoutImages = filteredDiamonds.filter(d => !d.imageUrl || !d.imageUrl.trim());
    
    const sortByOption = (diamonds: any[]) => {
      switch (sortOption) {
        case "price_asc":
          return [...diamonds].sort((a, b) => a.price - b.price);
        case "price_desc":
          return [...diamonds].sort((a, b) => b.price - a.price);
        case "carat_asc":
          return [...diamonds].sort((a, b) => a.carat - b.carat);
        case "carat_desc":
          return [...diamonds].sort((a, b) => b.carat - a.carat);
        case "newest":
          return [...diamonds].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        default:
          return diamonds;
      }
    };
    
    // Return sorted diamonds with images first, then without images
    return [...sortByOption(withImages), ...sortByOption(withoutImages)];
  }, [filteredDiamonds, sortOption]);

  const displayedDiamonds = useMemo(() => 
    sortedDiamonds.slice(0, displayedCount), 
    [sortedDiamonds, displayedCount]
  );

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load more handler with proper loading state
  const loadMore = useCallback(() => {
    if (isLoadingMore || displayedCount >= sortedDiamonds.length) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, sortedDiamonds.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, displayedCount, sortedDiamonds.length]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      setDisplayedCount(ITEMS_PER_PAGE);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Filter update handler
  const handleUpdateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchQuery("");
  }, []);

  // Apply filters handler (for mobile optimization)
  const handleApplyFilters = useCallback(() => {
    // Filters are applied automatically via state changes
    // This can be used for analytics or UI feedback
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  }, []);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 500);

      // Load more when near bottom
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrolled = scrollTop + clientHeight;

      if (scrollHeight - scrolled < 200 && !isLoadingMore && displayedCount < sortedDiamonds.length) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, displayedCount, sortedDiamonds.length, loadMore]);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if ('gc' in window && typeof window.gc === 'function') {
          window.gc();
        }
      } catch (e) {
        // Ignore errors
      }
    };
  }, []);

  if (loading && displayedDiamonds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedStoreHeader 
          totalDiamonds={0}
          sortBy={sortOption}
          onSortChange={setSortOption}
          onOpenFilters={() => {}}
        />
        <TelegramStoreFilters 
          filters={filters}
          onUpdateFilter={handleUpdateFilter}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
          diamonds={[]}
        />
        <div className="container mx-auto px-3 py-4">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <DiamondCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedStoreHeader 
        totalDiamonds={sortedDiamonds.length}
        sortBy={sortOption}
        onSortChange={setSortOption}
        onOpenFilters={() => {}}
      />
      
      <TelegramStoreFilters 
        filters={filters}
        onUpdateFilter={handleUpdateFilter}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
        diamonds={diamonds}
      />

      <div className="container mx-auto px-3 py-4">
        {displayedDiamonds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No diamonds found matching your criteria</p>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {displayedDiamonds.length} of {sortedDiamonds.length} diamonds
            </div>

            {/* Diamond grid */}
            <div className="grid grid-cols-2 gap-3">
              {displayedDiamonds.map((diamond, index) => (
                <OptimizedDiamondCard
                  key={diamond.id}
                  diamond={diamond}
                  index={index}
                />
              ))}
            </div>

            {/* Load more / Loading state */}
            {displayedCount < sortedDiamonds.length && (
              <div className="text-center mt-6">
                {isLoadingMore ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <DiamondCardSkeleton key={`loading-${i}`} />
                    ))}
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={loadMore}
                    className="w-full max-w-sm"
                  >
                    Load More ({sortedDiamonds.length - displayedCount} remaining)
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Scroll to top button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(StorePage);
