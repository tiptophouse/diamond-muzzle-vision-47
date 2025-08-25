
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
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    sortBy,
    sortOrder,
    handleSort,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedDiamonds,
    handleSearch
  } = useInventorySearch(allDiamonds);

  const handleRefresh = async () => {
    await fetchData();
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
            totalCount={allDiamonds.length}
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
            totalCount={allDiamonds.length}
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
          totalCount={allDiamonds.length}
        />
        
        <InventoryTable
          data={paginatedDiamonds}
          onDelete={handleDeleteDiamond}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </UnifiedLayout>
  );
}
