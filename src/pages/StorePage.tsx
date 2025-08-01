import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { OptimizedDiamondCard } from "@/components/store/OptimizedDiamondCard";
import { DiamondCardSkeleton } from "@/components/store/DiamondCardSkeleton";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Filter, SortAsc, AlertCircle, Search } from "lucide-react";
import { toast } from 'sonner';
import { Diamond } from "@/components/inventory/InventoryTable";
import { TelegramStoreFilters } from "@/components/store/TelegramStoreFilters";
import { TelegramSortSheet } from "@/components/store/TelegramSortSheet";
import { getTelegramWebApp } from "@/utils/telegramWebApp";

// Telegram memory management
const tg = getTelegramWebApp();
const ITEMS_PER_PAGE = 6; // Reduced for better performance
const SKELETON_COUNT = 3; // Fewer skeletons

function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState("most-popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const stockNumber = searchParams.get('stock');
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  // Telegram memory optimization
  useEffect(() => {
    if (tg) {
      // Clear any cached data when component mounts
      try {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('diamond-images')) {
                caches.delete(name);
              }
            });
          });
        }
      } catch (e) {
        console.log('Cache cleanup skipped');
      }
    }
  }, []);

  // Enhanced image priority detection for better 360° and image sorting
  const getImagePriority = useCallback((diamond: Diamond) => {
    // Priority 0: 360° / 3D images (highest priority)
    if (diamond.gem360Url && diamond.gem360Url.trim()) {
      return 0;
    }
    
    // Check for 360° indicators in imageUrl or picture fields
    const imageUrl = diamond.imageUrl || diamond.picture || '';
    if (imageUrl && (
      imageUrl.includes('360') || 
      imageUrl.includes('3d') || 
      imageUrl.includes('rotate') ||
      imageUrl.includes('my360.sela') || // Your specific 360° provider
      imageUrl.includes('gem360')
    )) {
      return 0; // Treat as 360° image
    }
    
    // Priority 1: Regular images (second priority)
    if (imageUrl && imageUrl.trim()) {
      return 1;
    }
    
    // Priority 2: No images (lowest priority)
    return 2;
  }, []);

  // Memoized sorted diamonds with enhanced image preference
  const sortedDiamonds = useMemo(() => {
    const diamonds = [...filteredDiamonds];
    
    diamonds.sort((a, b) => {
      const priorityA = getImagePriority(a);
      const priorityB = getImagePriority(b);
      
      // First sort by image priority: 360°/3D > regular image > no image
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same image priority, sort by user selection
      switch (sortBy) {
        case "price-low-high":
          return a.price - b.price;
        case "price-high-low":
          return b.price - a.price;
        case "carat-low-high":
          return a.carat - b.carat;
        case "carat-high-low":
          return b.carat - a.carat;
        case "newest":
          return a.stockNumber.localeCompare(b.stockNumber);
        case "most-popular":
        default:
          return 0;
      }
    });
    
    console.log('🔍 StorePage - Diamond sorting results:', {
      total: diamonds.length,
      with360Images: diamonds.filter(d => getImagePriority(d) === 0).length,
      withRegularImages: diamonds.filter(d => getImagePriority(d) === 1).length,
      withoutImages: diamonds.filter(d => getImagePriority(d) === 2).length
    });
    
    return diamonds;
  }, [filteredDiamonds, sortBy, getImagePriority]);

  // Paginated diamonds for performance
  const paginatedDiamonds = useMemo(() => {
    return sortedDiamonds.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [sortedDiamonds, currentPage]);

  // Infinite scroll with intersection observer
  const lastDiamondElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && paginatedDiamonds.length < sortedDiamonds.length) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { rootMargin: '100px' });
    
    if (node) observerRef.current.observe(node);
  }, [loading, paginatedDiamonds.length, sortedDiamonds.length]);

  // Filter to specific diamond if URL parameters are provided
  const finalFilteredDiamonds = useMemo(() => {
    if (stockNumber) {
      const stockMatch = sortedDiamonds.filter(diamond => 
        diamond.stockNumber === stockNumber
      );
      if (stockMatch.length > 0) {
        return stockMatch;
      }
    }
    return paginatedDiamonds;
  }, [paginatedDiamonds, stockNumber, sortedDiamonds]);

  // Auto-scroll to diamond if found via stock parameter
  useEffect(() => {
    if (stockNumber && finalFilteredDiamonds.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`diamond-${stockNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stockNumber, finalFilteredDiamonds]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setCurrentPage(1); // Reset pagination
      await refetch();
      toast.success('Store refreshed!');
    } catch (error) {
      toast.error('Failed to refresh');
      throw error;
    }
  }, [refetch]);

  const handleAddDiamond = useCallback(() => {
    impactOccurred('medium');
    navigate('/upload-single-stone');
  }, [impactOccurred, navigate]);

  const handleOpenFilters = useCallback(() => {
    selectionChanged();
    setShowFilters(true);
  }, [selectionChanged]);

  const handleOpenSort = useCallback(() => {
    selectionChanged();
    setShowSort(true);
  }, [selectionChanged]);

  const handleApplyFilters = useCallback(() => {
    impactOccurred('light');
    setCurrentPage(1); // Reset pagination when filters change
    setShowFilters(false);
  }, [impactOccurred]);

  const handleApplySort = useCallback((newSortBy: string) => {
    impactOccurred('light');
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset pagination when sort changes
    setShowSort(false);
  }, [impactOccurred]);

  const activeFiltersCount = useMemo(() => 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length + 
    filters.cuts.length + 
    filters.fluorescence.length,
    [filters]
  );

  // Render store content
  const renderStoreContent = useMemo(() => {
    if (loading && currentPage === 1) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <DiamondCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8 px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="text-base font-medium text-foreground mb-2">Error Loading Diamonds</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      );
    }

    if (finalFilteredDiamonds.length === 0) {
      return (
        <div className="flex items-center justify-center py-8 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">No Diamonds Found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
          {finalFilteredDiamonds.map((diamond, index) => {
            const isLast = index === finalFilteredDiamonds.length - 1;
            return (
              <div
                key={diamond.id}
                ref={isLast ? lastDiamondElementRef : undefined}
                id={`diamond-${diamond.stockNumber}`}
              >
                <OptimizedDiamondCard 
                  diamond={diamond}
                  index={index}
                  onUpdate={refetch}
                />
              </div>
            );
          })}
        </div>
        
        {/* Loading indicator for infinite scroll */}
        {loading && currentPage > 1 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Load more info */}
        {paginatedDiamonds.length < sortedDiamonds.length && !loading && (
          <div className="text-center py-4 px-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedDiamonds.length} of {sortedDiamonds.length} diamonds
            </p>
          </div>
        )}
      </>
    );
  }, [loading, currentPage, error, finalFilteredDiamonds, lastDiamondElementRef, refetch, paginatedDiamonds.length, sortedDiamonds.length]);

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Diamonds</h1>
                <p className="text-xs text-muted-foreground">
                  {finalFilteredDiamonds.length} available • Sorted by images first
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenSort}
                  className="h-8 px-2 text-xs"
                >
                  <SortAsc className="h-3 w-3 mr-1" />
                  Sort
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenFilters}
                  className="h-8 px-2 text-xs relative"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Diamond Grid */}
        <div className="py-3">
          {renderStoreContent}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={handleAddDiamond}
            size="lg"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters Bottom Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <SheetHeader className="px-4 py-3 border-b border-border">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <TelegramStoreFilters
              filters={filters}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
              onApplyFilters={handleApplyFilters}
              diamonds={diamonds || []}
            />
          </SheetContent>
        </Sheet>

        {/* Sort Bottom Sheet */}
        <Sheet open={showSort} onOpenChange={setShowSort}>
          <SheetContent side="bottom" className="h-auto p-0">
            <SheetHeader className="px-4 py-3 border-b border-border">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <SortAsc className="h-4 w-4" />
                Sort by
              </SheetTitle>
            </SheetHeader>
            <TelegramSortSheet
              currentSort={sortBy}
              onSortChange={handleApplySort}
            />
          </SheetContent>
        </Sheet>
      </div>
    </MobilePullToRefresh>
  );
}

export default StorePage;
