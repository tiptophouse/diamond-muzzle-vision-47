import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFilters } from "@/components/store/StoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";

export default function StorePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading diamonds...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Top Filters Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <StoreFilters
              filters={filters}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
              diamonds={diamonds}
              isHorizontal={true}
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="text-sm text-gray-600">
              {filteredDiamonds.length} of {diamonds.length} Results
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Sort By:</span>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>Best Match</option>
                <option>Price Low to High</option>
                <option>Price High to Low</option>
                <option>Carat Low to High</option>
                <option>Carat High to Low</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StoreGrid 
            diamonds={filteredDiamonds}
            loading={loading}
            error={error}
            onUpdate={refetch}
          />
        </div>

        {/* Mobile Filter Drawer - keeping for mobile compatibility */}
        <StoreFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          diamonds={diamonds}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          isMobile
        />
      </div>
    </Layout>
  );
}
