
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <StoreHeader 
          totalDiamonds={filteredDiamonds.length}
          onOpenFilters={() => setIsFilterOpen(true)}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-8">
                <StoreFilters
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onClearFilters={clearFilters}
                  diamonds={diamonds}
                />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <StoreGrid 
                diamonds={filteredDiamonds}
                loading={loading}
                error={error}
                onUpdate={refetch}
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
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
