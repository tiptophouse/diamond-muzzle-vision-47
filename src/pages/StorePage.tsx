import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { FigmaDiamondCard } from "@/components/store/FigmaDiamondCard";
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

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState("most-popular");
  const [searchParams] = useSearchParams();
  const stockNumber = searchParams.get('stock');
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();

  const navigate = useNavigate();

  // Sort diamonds based on selected sort option
  const sortedDiamonds = useMemo(() => {
    const diamonds = [...filteredDiamonds];
    
    switch (sortBy) {
      case "price-low-high":
        return diamonds.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return diamonds.sort((a, b) => b.price - a.price);
      case "carat-low-high":
        return diamonds.sort((a, b) => a.carat - b.carat);
      case "carat-high-low":
        return diamonds.sort((a, b) => b.carat - a.carat);
      case "newest":
        return diamonds.sort((a, b) => a.stockNumber.localeCompare(b.stockNumber));
      case "most-popular":
      default:
        return diamonds;
    }
  }, [filteredDiamonds, sortBy]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast.success('Store refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh store');
      throw error;
    }
  }, [refetch]);

  // Filter to specific diamond if URL parameters are provided (optimized with useMemo)
  const finalFilteredDiamonds = useMemo(() => {
    if (stockNumber) {
      const stockMatch = sortedDiamonds.filter(diamond => 
        diamond.stockNumber === stockNumber
      );
      if (stockMatch.length > 0) {
        return stockMatch;
      }
    }
    
    // If no stock match or no stock parameter, check other URL parameters for filtering
    const carat = searchParams.get('carat');
    const color = searchParams.get('color');
    const clarity = searchParams.get('clarity');
    const shape = searchParams.get('shape');
    
    if (carat || color || clarity || shape) {
      const paramMatch = sortedDiamonds.filter(diamond => {
        const matches = [];
        if (carat) matches.push(Math.abs(diamond.carat - parseFloat(carat)) < 0.01);
        if (color) matches.push(diamond.color === color);
        if (clarity) matches.push(diamond.clarity === clarity);
        if (shape) matches.push(diamond.shape === shape);
        return matches.every(match => match);
      });
      
      if (paramMatch.length > 0) {
        return paramMatch;
      }
    }
    
    return sortedDiamonds;
  }, [sortedDiamonds, stockNumber, searchParams]);

  // Auto-scroll to diamond if found via stock parameter
  useEffect(() => {
    if (stockNumber && finalFilteredDiamonds.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`diamond-${stockNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [stockNumber, finalFilteredDiamonds]);

  const handleAddDiamond = () => {
    impactOccurred('medium');
    navigate('/upload-single-stone');
  };

  const handleOpenFilters = () => {
    selectionChanged();
    setShowFilters(true);
  };

  const handleOpenSort = () => {
    selectionChanged();
    setShowSort(true);
  };

  const handleApplyFilters = () => {
    impactOccurred('light');
    setShowFilters(false);
  };

  const handleApplySort = (newSortBy: string) => {
    impactOccurred('light');
    setSortBy(newSortBy);
    setShowSort(false);
  };

  // Memoized store grid to prevent unnecessary re-renders
  const renderStoreGrid = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {Array.from({ length: 8 }, (_, i) => (
            <DiamondCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Diamonds</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      );
    }

    if (finalFilteredDiamonds.length === 0) {
      return (
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Diamonds Found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more diamonds.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
        {finalFilteredDiamonds.slice(0, 20).map((diamond, index) => (
          <FigmaDiamondCard 
            key={diamond.id} 
            diamond={diamond}
            index={index}
            onUpdate={refetch}
          />
        ))}
        {finalFilteredDiamonds.length > 20 && (
          <div className="col-span-full text-center py-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // Load more diamonds logic can be implemented here
                toast.info('Load more feature coming soon!');
              }}
            >
              Load More ({finalFilteredDiamonds.length - 20} remaining)
            </Button>
          </div>
        )}
      </div>
    );
  }, [loading, error, finalFilteredDiamonds, refetch]);

  const activeFiltersCount = 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length + 
    filters.cuts.length + 
    filters.fluorescence.length;

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Diamonds</h1>
                <p className="text-sm text-muted-foreground">
                  {finalFilteredDiamonds.length} diamonds available
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenSort}
                  className="h-8 px-3"
                >
                  <SortAsc className="h-4 w-4 mr-1" />
                  Sort
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenFilters}
                  className="h-8 px-3 relative"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Diamond Grid */}
        <div className="py-4">
          {renderStoreGrid}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-4 z-40">
          <Button
            onClick={handleAddDiamond}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Filters Bottom Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <SheetHeader className="px-4 py-3 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
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
              <SheetTitle className="flex items-center gap-2">
                <SortAsc className="h-5 w-5" />
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