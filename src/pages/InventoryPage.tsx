
import React from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryTableEmpty } from '@/components/inventory/InventoryTableEmpty';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function InventoryPage() {
  const {
    diamonds,
    filteredDiamonds,
    loading,
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    refreshData,
    handleSearch,
    handleFilterChange,
    handleSort,
    handlePageChange,
    handleDeleteDiamond,
    handleEditDiamond,
    handleToggleVisibility
  } = useInventoryManagement();

  // Set up Telegram navigation
  useUnifiedTelegramNavigation({
    showMainButton: true,
    mainButtonText: 'Add Diamond',
    mainButtonColor: '#059669'
  });

  return (
    <UnifiedLayout>
      <div className="space-y-6 p-4">
        <InventoryHeader 
          totalDiamonds={diamonds.length}
          onRefresh={refreshData}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {loading ? (
          <InventoryTableLoading />
        ) : diamonds.length === 0 ? (
          <InventoryTableEmpty />
        ) : (
          <InventoryTable
            diamonds={filteredDiamonds}
            onDelete={handleDeleteDiamond}
            onEdit={handleEditDiamond}
            onToggleVisibility={handleToggleVisibility}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </UnifiedLayout>
  );
}
