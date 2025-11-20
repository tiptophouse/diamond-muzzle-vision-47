import { useState, useMemo } from "react";
import { useAuctionsData } from "@/hooks/useAuctionsData";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search, Hammer, TrendingUp } from "lucide-react";
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import { Badge } from "@/components/ui/badge";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { WebhookRegistrationButton } from "@/components/admin/WebhookRegistrationButton";

const ITEMS_PER_PAGE = 12;

function AuctionsListPage() {
  const { auctions, loading, error, refetch } = useAuctionsData();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedClarities, setSelectedClarities] = useState<string[]>([]);
  const [caratRange, setCaratRange] = useState<[number, number]>([0, 10]);

  const tg = getTelegramWebApp();

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const shapes = new Set<string>();
    const colors = new Set<string>();
    const clarities = new Set<string>();
    
    auctions.forEach(auction => {
      if (auction.diamond) {
        shapes.add(auction.diamond.shape);
        colors.add(auction.diamond.color);
        clarities.add(auction.diamond.clarity);
      }
    });

    return {
      shapes: Array.from(shapes).sort(),
      colors: Array.from(colors).sort(),
      clarities: Array.from(clarities).sort(),
    };
  }, [auctions]);

  // Filter and search auctions
  const filteredAuctions = useMemo(() => {
    return auctions.filter(auction => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      if (searchQuery && auction.diamond) {
        const matchesSearch = 
          auction.stock_number.toLowerCase().includes(searchLower) ||
          auction.diamond.shape.toLowerCase().includes(searchLower) ||
          auction.diamond.color.toLowerCase().includes(searchLower) ||
          auction.diamond.clarity.toLowerCase().includes(searchLower) ||
          (auction.diamond.certificate_number?.toString() || '').includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      if (!auction.diamond) return true;

      // Price filter
      if (auction.current_price < priceRange[0] || auction.current_price > priceRange[1]) {
        return false;
      }

      // Shape filter
      if (selectedShapes.length > 0 && !selectedShapes.includes(auction.diamond.shape)) {
        return false;
      }

      // Color filter
      if (selectedColors.length > 0 && !selectedColors.includes(auction.diamond.color)) {
        return false;
      }

      // Clarity filter
      if (selectedClarities.length > 0 && !selectedClarities.includes(auction.diamond.clarity)) {
        return false;
      }

      // Carat filter
      if (auction.diamond.weight < caratRange[0] || auction.diamond.weight > caratRange[1]) {
        return false;
      }

      return true;
    });
  }, [auctions, searchQuery, priceRange, selectedShapes, selectedColors, selectedClarities, caratRange]);

  // Pagination
  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const paginatedAuctions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAuctions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAuctions, currentPage]);

  const activeFiltersCount = 
    selectedShapes.length + 
    selectedColors.length + 
    selectedClarities.length +
    (priceRange[0] !== 0 || priceRange[1] !== 1000000 ? 1 : 0) +
    (caratRange[0] !== 0 || caratRange[1] !== 10 ? 1 : 0);

  const clearFilters = () => {
    setSelectedShapes([]);
    setSelectedColors([]);
    setSelectedClarities([]);
    setPriceRange([0, 1000000]);
    setCaratRange([0, 10]);
    if (tg && 'HapticFeedback' in tg) {
      (tg as any).HapticFeedback?.notificationOccurred('success');
    }
  };

  const toggleFilter = (type: 'shapes' | 'colors' | 'clarities', value: string) => {
    if (tg && 'HapticFeedback' in tg) {
      (tg as any).HapticFeedback?.selectionChanged();
    }
    
    const setters = {
      shapes: setSelectedShapes,
      colors: setSelectedColors,
      clarities: setSelectedClarities,
    };

    const getters = {
      shapes: selectedShapes,
      colors: selectedColors,
      clarities: selectedClarities,
    };

    const setter = setters[type];
    const current = getters[type];

    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading auctions</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <MobilePullToRefresh onRefresh={refetch}>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Hammer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Live Auctions</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredAuctions.length} active {filteredAuctions.length === 1 ? 'auction' : 'auctions'}
                  </p>
                </div>
              </div>
              <WebhookRegistrationButton />
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by stock, shape, color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (tg && 'HapticFeedback' in tg) (tg as any).HapticFeedback?.impactOccurred('light');
                  setShowFilters(true);
                }}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No active auctions found</p>
              {activeFiltersCount > 0 && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <InventoryPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Filters Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Auctions</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Shape Filter */}
              {filterOptions.shapes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Shape</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.shapes.map(shape => (
                      <Badge
                        key={shape}
                        variant={selectedShapes.includes(shape) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter('shapes', shape)}
                      >
                        {shape}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {filterOptions.colors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.colors.map(color => (
                      <Badge
                        key={color}
                        variant={selectedColors.includes(color) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter('colors', color)}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clarity Filter */}
              {filterOptions.clarities.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Clarity</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.clarities.map(clarity => (
                      <Badge
                        key={clarity}
                        variant={selectedClarities.includes(clarity) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter('clarities', clarity)}
                      >
                        {clarity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </MobilePullToRefresh>
  );
}

export default AuctionsListPage;
