
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStoreData } from '@/hooks/useStoreData';
import { useStoreFilters } from '@/hooks/useStoreFilters';
import { EnhancedStoreHeader } from '@/components/store/EnhancedStoreHeader';
import { TelegramStoreFilters } from '@/components/store/TelegramStoreFilters';
import { OptimizedDiamondCard } from '@/components/store/OptimizedDiamondCard';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { Diamond } from '@/types/diamond';

export default function CatalogPage() {
  const { data, isLoading, error, refetch } = useStoreData();
  const {
    filters,
    filteredDiamonds,
    updateFilter,
    clearFilters,
    imageStats
  } = useStoreFilters(data?.diamonds || []);

  const [sortBy, setSortBy] = useState<'price' | 'carat' | 'recent'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <DashboardLoading onEmergencyMode={() => {}} />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <p className="text-red-600">Error loading catalog: {error.message}</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const handleOpenFilters = () => setShowFilters(true);
  const handleSortChange = (value: string) => {
    setSortBy(value as 'price' | 'carat' | 'recent');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="px-4 py-3">
            <EnhancedStoreHeader
              totalDiamonds={data?.total || 0}
              onOpenFilters={handleOpenFilters}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        <div className="p-4">
          <TelegramStoreFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
            onApplyFilters={() => setShowFilters(false)}
            diamonds={data?.diamonds || []}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredDiamonds.map((diamond: Diamond) => (
              <OptimizedDiamondCard
                key={diamond.stockNumber}
                diamond={diamond}
              />
            ))}
          </div>

          {filteredDiamonds.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No diamonds match your current filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
