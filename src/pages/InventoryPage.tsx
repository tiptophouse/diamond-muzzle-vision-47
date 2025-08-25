
import React from 'react';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryTableEmpty } from '@/components/inventory/InventoryTableEmpty';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventorySearch } from '@/hooks/useInventorySearch';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';
import { useState } from 'react';

export default function InventoryPage() {
  const { allDiamonds, loading, error, fetchData } = useInventoryData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('carat');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { filteredDiamonds } = useInventorySearch({
    diamonds: allDiamonds,
    searchTerm,
    filters,
    sortBy,
    sortOrder
  });

  const totalPages = Math.ceil(filteredDiamonds.length / itemsPerPage);
  const paginatedDiamonds = filteredDiamonds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Set up Telegram navigation
  useUnifiedTelegramNavigation({
    showMainButton: true,
    mainButtonText: 'Add Diamond',
    mainButtonColor: '#059669'
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteDiamond = async (diamondId: string) => {
    console.log('Delete diamond:', diamondId);
    // Implementation would go here
    await fetchData(); // Refresh after delete
  };

  const handleEditDiamond = (diamondId: string) => {
    console.log('Edit diamond:', diamondId);
    // Implementation would go here
  };

  const handleToggleVisibility = async (diamondId: string) => {
    console.log('Toggle visibility:', diamondId);
    // Implementation would go here
    await fetchData(); // Refresh after toggle
  };

  return (
    <UnifiedLayout>
      <div className="space-y-6 p-4">
        <InventoryHeader 
          onRefresh={fetchData}
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
        ) : allDiamonds.length === 0 ? (
          <InventoryTableEmpty />
        ) : (
          <InventoryTable
            diamonds={paginatedDiamonds}
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
