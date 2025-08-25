
import React, { useState, useMemo } from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { InventoryTableEmpty } from '@/components/inventory/InventoryTableEmpty';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventorySearch } from '@/hooks/useInventorySearch';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';
import { Diamond } from '@/components/inventory/InventoryTable';

export default function InventoryPage() {
  // Clear any navigation buttons for inventory page
  useUnifiedTelegramNavigation();

  const { allDiamonds, loading, error, fetchData } = useInventoryData();
  const {
    searchTerm,
    setSearchTerm,
    filteredDiamonds,
    sortBy,
    sortOrder,
    handleSort,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedDiamonds
  } = useInventorySearch(allDiamonds);

  const handleRefresh = async () => {
    await fetchData();
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteDiamond = async (diamondId: string) => {
    console.log('Delete diamond:', diamondId);
    // Implementation would go here
    await fetchData(); // Refresh after delete
  };

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="space-y-4">
          <InventoryHeader 
            onRefresh={handleRefresh}
            onFilterChange={handleFilterChange}
            onSort={handleSort}
          />
          <InventoryTableLoading />
        </div>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout>
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading inventory: {error}</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (allDiamonds.length === 0) {
    return (
      <UnifiedLayout>
        <div className="space-y-4">
          <InventoryHeader 
            onRefresh={handleRefresh}
            onFilterChange={handleFilterChange}
            onSort={handleSort}
          />
          <InventoryTableEmpty />
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="space-y-4">
        <InventoryHeader 
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          onSort={handleSort}
        />
        
        <InventoryTable
          data={paginatedDiamonds}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onDelete={handleDeleteDiamond}
          onUpdate={fetchData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </UnifiedLayout>
  );
}
