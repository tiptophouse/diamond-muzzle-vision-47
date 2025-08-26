import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { InventoryTableEmpty } from '@/components/inventory/InventoryTableEmpty';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { useDeleteDiamond } from '@/hooks/inventory/useDeleteDiamond';
import { fetchInventoryData } from '@/services/inventoryDataService';
import { Diamond } from '@/components/inventory/InventoryTable';

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [shapeFilter, setShapeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localDiamonds, setLocalDiamonds] = useState<Diamond[]>([]);
  const { inventoryChangeKey } = useInventoryDataSync();
  
  const { deleteDiamond, isDeleting } = useDeleteDiamond();

  const { data: diamonds = [], isLoading, error, refetch } = useQuery({
    queryKey: ['inventory', inventoryChangeKey],
    queryFn: fetchInventoryData,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
  });

  // Keep local state in sync with server data
  useEffect(() => {
    setLocalDiamonds(diamonds);
  }, [diamonds]);

  // Optimistic removal function
  const removeDiamondFromState = (diamondId: string) => {
    setLocalDiamonds(prev => prev.filter(d => d.id !== diamondId));
  };

  // Optimistic restore function
  const restoreDiamondToState = (diamond: Diamond) => {
    setLocalDiamonds(prev => {
      const exists = prev.find(d => d.id === diamond.id);
      if (exists) return prev;
      return [...prev, diamond];
    });
  };

  const handleDelete = async (diamondId: string) => {
    const diamondToDelete = localDiamonds.find(d => d.id === diamondId);
    
    const success = await deleteDiamond(
      diamondId,
      removeDiamondFromState,
      restoreDiamondToState,
      diamondToDelete
    );

    if (success) {
      // Trigger a background refetch to ensure consistency
      setTimeout(() => refetch(), 1000);
    }
  };

  // Filter and sort diamonds
  const filteredDiamonds = localDiamonds
    .filter(diamond => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          diamond.stockNumber?.toLowerCase().includes(query) ||
          diamond.shape?.toLowerCase().includes(query) ||
          diamond.color?.toLowerCase().includes(query) ||
          diamond.clarity?.toLowerCase().includes(query) ||
          diamond.certificateNumber?.toString().includes(query)
        );
      }
      return true;
    })
    .filter(diamond => {
      if (shapeFilter && shapeFilter !== 'all') {
        return diamond.shape?.toLowerCase() === shapeFilter.toLowerCase();
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Diamond];
      let bValue: any = b[sortBy as keyof Diamond];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (isLoading) {
    return (
      <TelegramLayout>
        <div className="p-4">
          <InventoryHeader />
          <InventoryTableLoading />
        </div>
      </TelegramLayout>
    );
  }

  if (error) {
    return (
      <TelegramLayout>
        <div className="p-4">
          <InventoryHeader />
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load inventory: {error.message}</p>
            <button 
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="p-4 space-y-4">
        <InventoryHeader />
        
        <InventoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          shapeFilter={shapeFilter}
          onShapeFilterChange={setShapeFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {filteredDiamonds.length === 0 ? (
          <InventoryTableEmpty 
            hasSearchQuery={!!searchQuery || !!shapeFilter}
            onClearFilters={() => {
              setSearchQuery('');
              setShapeFilter('');
            }}
          />
        ) : (
          <InventoryTable 
            data={filteredDiamonds} 
            onDelete={handleDelete}
          />
        )}
      </div>
    </TelegramLayout>
  );
}
