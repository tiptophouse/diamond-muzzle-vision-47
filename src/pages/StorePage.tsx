
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicStoreLayout } from "@/components/store/PublicStoreLayout";
import { StoreFilters } from "@/components/store/StoreFilters";
import { StoreProductGrid } from "@/components/store/StoreProductGrid";
import { StoreProductModal } from "@/components/store/StoreProductModal";
import { useStoreData } from "@/hooks/useStoreData";

export interface StoreFilters {
  shape: string[];
  color: [string, string];
  clarity: string[];
  carat: [number, number];
  price: [number, number];
  cut: string[];
  search: string;
}

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<StoreFilters>({
    shape: [],
    color: ['D', 'Z'],
    clarity: [],
    carat: [0.3, 10],
    price: [500, 100000],
    cut: [],
    search: '',
  });
  
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'carat-desc' | 'carat-asc'>('price-asc');
  const [selectedDiamond, setSelectedDiamond] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { diamonds, loading, error, refetch } = useStoreData(filters, sortBy);

  // Handle direct links to specific diamonds
  useEffect(() => {
    const itemId = searchParams.get('item');
    if (itemId && diamonds.length > 0) {
      const targetDiamond = diamonds.find(d => d.id === itemId);
      if (targetDiamond) {
        setSelectedDiamond(targetDiamond);
      }
    }
  }, [searchParams, diamonds]);

  // Refresh data when component mounts to ensure latest store items
  useEffect(() => {
    refetch();
  }, []);

  const handleFilterChange = (newFilters: Partial<StoreFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      shape: [],
      color: ['D', 'Z'],
      clarity: [],
      carat: [0.3, 10],
      price: [500, 100000],
      cut: [],
      search: '',
    });
  };

  const handleDiamondClick = (diamond: any) => {
    setSelectedDiamond(diamond);
    // Update URL to include the diamond ID for sharing
    setSearchParams({ item: diamond.id });
  };

  const handleModalClose = () => {
    setSelectedDiamond(null);
    // Remove item parameter from URL
    setSearchParams({});
  };

  return (
    <PublicStoreLayout
      onSearch={(search) => handleFilterChange({ search })}
      searchQuery={filters.search}
      onToggleFilters={() => setShowFilters(!showFilters)}
      resultsCount={diamonds.length}
      sortBy={sortBy}
      onSortChange={setSortBy}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
          <StoreFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            className="lg:sticky lg:top-6"
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <StoreProductGrid
            diamonds={diamonds}
            loading={loading}
            error={error}
            onDiamondClick={handleDiamondClick}
          />
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedDiamond && (
        <StoreProductModal
          diamond={selectedDiamond}
          isOpen={!!selectedDiamond}
          onClose={handleModalClose}
        />
      )}
    </PublicStoreLayout>
  );
}
