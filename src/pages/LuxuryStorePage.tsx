
import { useState } from "react";
import { LuxuryStoreLayout } from "@/components/luxury-store/LuxuryStoreLayout";
import { LuxuryFilters } from "@/components/luxury-store/LuxuryFilters";
import { LuxuryProductGrid } from "@/components/luxury-store/LuxuryProductGrid";
import { LuxuryProductModal } from "@/components/luxury-store/LuxuryProductModal";
import { useLuxuryStoreData } from "@/hooks/useLuxuryStoreData";

export interface LuxuryStoreFilters {
  shape: string[];
  color: [string, string];
  clarity: string[];
  carat: [number, number];
  price: [number, number];
  cut: string[];
  search: string;
}

export default function LuxuryStorePage() {
  const [filters, setFilters] = useState<LuxuryStoreFilters>({
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

  const { diamonds, loading, error } = useLuxuryStoreData(filters, sortBy);

  const handleFilterChange = (newFilters: Partial<LuxuryStoreFilters>) => {
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

  const handlePurchaseClick = (diamond: any) => {
    // Open Telegram chat - we'll implement this
    console.log('Opening Telegram chat for diamond:', diamond.id);
    // For now, we'll show an alert - will replace with actual Telegram integration
    alert(`Contacting seller about ${diamond.shape} ${diamond.carat}ct diamond...`);
  };

  return (
    <LuxuryStoreLayout
      onSearch={(search) => handleFilterChange({ search })}
      searchQuery={filters.search}
      onToggleFilters={() => setShowFilters(!showFilters)}
      resultsCount={diamonds.length}
      sortBy={sortBy}
      onSortChange={setSortBy}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Luxury Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
          <LuxuryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            className="lg:sticky lg:top-6"
          />
        </div>

        {/* Luxury Product Grid */}
        <div className="flex-1 min-w-0">
          <LuxuryProductGrid
            diamonds={diamonds}
            loading={loading}
            error={error}
            onDiamondClick={setSelectedDiamond}
            onPurchaseClick={handlePurchaseClick}
          />
        </div>
      </div>

      {/* Luxury Product Detail Modal */}
      {selectedDiamond && (
        <LuxuryProductModal
          diamond={selectedDiamond}
          isOpen={!!selectedDiamond}
          onClose={() => setSelectedDiamond(null)}
          onPurchaseClick={() => handlePurchaseClick(selectedDiamond)}
        />
      )}
    </LuxuryStoreLayout>
  );
}
