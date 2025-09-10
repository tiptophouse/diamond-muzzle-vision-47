
import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { EnhancedStoreGrid } from "@/components/store/EnhancedStoreGrid";
import { TelegramDiamondCard } from "@/components/store/TelegramDiamondCard";
import { DiamondCardSkeleton } from "@/components/store/DiamondCardSkeleton";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramNavigation } from "@/hooks/useTelegramNavigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Filter, SortAsc, AlertCircle, Search, Sparkles } from "lucide-react";
import { toast } from 'sonner';
import { Diamond } from "@/components/inventory/InventoryTable";
import { TelegramStoreFilters } from "@/components/store/TelegramStoreFilters";
import { TelegramSortSheet } from "@/components/store/TelegramSortSheet";
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";

// Telegram memory management
const tg = getTelegramWebApp();
const ITEMS_PER_PAGE = 24; // Show more items per page
const SKELETON_COUNT = 3; // Fewer skeletons

function CatalogPage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState("media-priority");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const stockNumber = searchParams.get('stock');
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();
  const { navigateWithFeedback } = useTelegramNavigation({
    showBackButton: false, // Store page doesn't need back button
    enableHapticFeedback: true
  });
  const navigate = useNavigate();

  // Telegram memory optimization
  useEffect(() => {
    if (tg) {
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

  // Enhanced media priority detection - CRITICAL PRIORITY ORDER: 3D > Image > Info Only
  const getMediaPriority = useCallback((diamond: Diamond) => {
    console.log('🎯 CATALOG: Checking media priority for', diamond.stockNumber, {
      gem360Url: diamond.gem360Url,
      imageUrl: diamond.imageUrl,
      price: diamond.price
    });

    // Priority 0: 3D/360° content (HIGHEST PRIORITY)
    if (diamond.gem360Url && diamond.gem360Url.trim()) {
      // Check for various 360° formats
      if (diamond.gem360Url.includes('gem360') || 
          diamond.gem360Url.includes('360') || 
          diamond.gem360Url.includes('vision360.html') ||
          diamond.gem360Url.includes('my360.sela') ||
          diamond.gem360Url.includes('3d')) {
        console.log('✨ CATALOG: Priority 0 - 3D/360° detected for', diamond.stockNumber);
        return 0;
      }
    }
    
    // Priority 1: Regular images (SECOND PRIORITY)
    if (diamond.imageUrl && diamond.imageUrl.trim() && diamond.imageUrl !== 'default') {
      console.log('🖼️ CATALOG: Priority 1 - Image detected for', diamond.stockNumber);
      return 1;
    }
    
    // Priority 2: Info only (LOWEST PRIORITY)
    console.log('📄 CATALOG: Priority 2 - Info only for', diamond.stockNumber);
    return 2;
  }, []);

  // Memoized sorted diamonds with STRICT media priority ordering
  const sortedDiamonds = useMemo(() => {
    const diamonds = [...filteredDiamonds];
    
    diamonds.sort((a, b) => {
      const priorityA = getMediaPriority(a);
      const priorityB = getMediaPriority(b);
      
      // FIRST: Always sort by media priority (3D > Image > Info Only)
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // SECOND: If same media priority, sort by user selection
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
        case "media-priority":
        default:
          // For same priority, sort by stock number
          return a.stockNumber.localeCompare(b.stockNumber);
      }
    });
    
    console.log('🔍 CATALOG: Media priority sorting results:', {
      total: diamonds.length,
      with3D: diamonds.filter(d => getMediaPriority(d) === 0).length,
      withImages: diamonds.filter(d => getMediaPriority(d) === 1).length,
      infoOnly: diamonds.filter(d => getMediaPriority(d) === 2).length,
      first5Diamonds: diamonds.slice(0, 5).map(d => ({
        stock: d.stockNumber,
        priority: getMediaPriority(d),
        has3D: !!(d.gem360Url && d.gem360Url.trim()),
        hasImage: !!(d.imageUrl && d.imageUrl.trim() && d.imageUrl !== 'default')
      }))
    });
    
    return diamonds;
  }, [filteredDiamonds, sortBy, getMediaPriority]);

  // Pagination - page size and slicing
  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedDiamonds.length / ITEMS_PER_PAGE)), [sortedDiamonds.length]);
  const paginatedDiamonds = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedDiamonds.slice(startIndex, endIndex);
  }, [sortedDiamonds, currentPage]);

  // Infinite scroll with intersection observer

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
      toast.success('Catalog refreshed!');
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

  // Get media type counts for header display
  const mediaCounts = useMemo(() => {
    const with3D = sortedDiamonds.filter(d => getMediaPriority(d) === 0).length;
    const withImages = sortedDiamonds.filter(d => getMediaPriority(d) === 1).length;
    const infoOnly = sortedDiamonds.filter(d => getMediaPriority(d) === 2).length;
    return { with3D, withImages, infoOnly };
  }, [sortedDiamonds, getMediaPriority]);

  // Render catalog content
  const renderCatalogContent = useMemo(() => {
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
            <h3 className="text-base font-medium text-foreground mb-2">Error Loading Catalog</h3>
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
          {finalFilteredDiamonds.map((diamond, index) => (
            <div
              key={diamond.id}
              id={`diamond-${diamond.stockNumber}`}
            >
              <TelegramDiamondCard 
                diamond={diamond}
                index={index}
                onViewDetails={(diamond) => navigateWithFeedback(`/diamond/${diamond.id}`)}
              />
            </div>
          ))}
        </div>
        
      </>
    );
  }, [loading, currentPage, error, finalFilteredDiamonds, refetch, paginatedDiamonds.length, sortedDiamonds.length]);

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Motion Catalog
                </h1>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{sortedDiamonds.length} available • Tilt device for motion controls</p>
                  <div className="flex items-center gap-3 text-xs">
                    {mediaCounts.with3D > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        {mediaCounts.with3D} with 3D
                      </span>
                    )}
                    {mediaCounts.withImages > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {mediaCounts.withImages} with images
                      </span>
                    )}
                    {mediaCounts.infoOnly > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        {mediaCounts.infoOnly} info only
                      </span>
                    )}
                  </div>
                </div>
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

        {/* Enhanced Diamond Grid with Media Priority */}
        <div className="py-3">
          <EnhancedStoreGrid
            diamonds={finalFilteredDiamonds}
            loading={loading && currentPage === 1}
            error={error}
            onUpdate={refetch}
          />
          
          <div className="px-4 py-4">
            <InventoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
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

export default CatalogPage;
