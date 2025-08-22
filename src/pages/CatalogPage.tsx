
import React, { useState } from 'react';
import { useStoreData } from '@/hooks/useStoreData';
import { useStoreFilters } from '@/hooks/useStoreFilters';
import { EnhancedStoreHeader } from '@/components/store/EnhancedStoreHeader';
import { TelegramStoreFilters } from '@/components/store/TelegramStoreFilters';
import { OptimizedDiamondCard } from '@/components/store/OptimizedDiamondCard';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function CatalogPage() {
  const [page] = useState(1);
  const [sortBy, setSortBy] = useState('most-popular');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const { data, isLoading, error, refetch } = useStoreData(page, 20);
  const { 
    filters, 
    updateFilter, 
    filteredDiamonds, 
    resetFilters 
  } = useStoreFilters(data?.diamonds || []);

  if (isLoading) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading diamonds...</p>
          </div>
        </div>
      </TelegramLayout>
    );
  }

  if (error) {
    return (
      <TelegramLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading store: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </TelegramLayout>
    );
  }

  const handleOpenFilters = () => {
    setFiltersOpen(true);
  };

  return (
    <TelegramLayout>
      <div className="space-y-4">
        {/* Header */}
        <EnhancedStoreHeader
          totalDiamonds={filteredDiamonds.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenFilters={handleOpenFilters}
        />

        {/* Filters Sheet */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="h-[80vh]">
            <TelegramStoreFilters
              filters={filters}
              onUpdateFilter={updateFilter}
            />
          </SheetContent>
        </Sheet>

        {/* Diamond Grid */}
        <div className="grid grid-cols-2 gap-3 pb-20">
          {filteredDiamonds.map((diamond) => (
            <OptimizedDiamondCard
              key={diamond.id}
              diamond={diamond}
            />
          ))}
        </div>

        {filteredDiamonds.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No diamonds found matching your criteria.</p>
            <Button onClick={resetFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </TelegramLayout>
  );
}
