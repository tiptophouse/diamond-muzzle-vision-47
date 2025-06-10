
import { Layout } from "@/components/layout/Layout";
import { PremiumStoreHeader } from "@/components/store/PremiumStoreHeader";
import { VirtualizedStoreGrid } from "@/components/premium/VirtualizedStoreGrid";
import { EnhancedStoreFilters } from "@/components/store/EnhancedStoreFilters";
import { useEnhancedStoreData } from "@/hooks/useEnhancedStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";

export default function StorePage() {
  const { 
    diamonds, 
    loading, 
    error, 
    stats,
    refreshData 
  } = useEnhancedStoreData();

  const {
    filteredDiamonds,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filters,
    updateFilter,
    clearFilters,
    activeFilters
  } = useStoreFilters(diamonds);

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Premium header */}
        <PremiumStoreHeader
          totalDiamonds={filteredDiamonds.length}
          onOpenFilters={() => setShowFilters(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop filters sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <EnhancedStoreFilters
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>

            {/* Main content with virtualized grid */}
            <div className="flex-1 min-w-0">
              <VirtualizedStoreGrid
                diamonds={filteredDiamonds}
                loading={loading}
                error={error}
                onUpdate={refreshData}
              />
            </div>
          </div>
        </div>

        {/* Mobile filters modal */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white w-full max-h-[80vh] rounded-t-3xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <EnhancedStoreFilters
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
