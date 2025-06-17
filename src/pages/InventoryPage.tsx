
import { Layout } from "@/components/layout/Layout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondForm } from "@/components/inventory/DiamondForm";
import { useState } from "react";

export default function InventoryPage() {
  const {
    data: diamonds,
    loading,
    error,
    pagination,
    setPagination,
    handleRefresh,
  } = useInventoryData();

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredDiamonds,
  } = useInventorySearch(diamonds);

  const { 
    editingDiamond, 
    setEditingDiamond, 
    updateDiamond, 
    deleteDiamond,
    isLoading: crudLoading 
  } = useInventoryCrud({
    onSuccess: handleRefresh,
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (diamond: any) => {
    setEditingDiamond(diamond);
  };

  const handleDelete = async (diamondId: string) => {
    if (window.confirm('Are you sure you want to delete this diamond?')) {
      await deleteDiamond(diamondId);
    }
  };

  const handleStoreToggle = async (stockNumber: string, isVisible: boolean) => {
    const diamond = diamonds.find(d => d.stockNumber === stockNumber);
    if (diamond) {
      await updateDiamond(diamond.id, {
        ...diamond,
        store_visible: isVisible
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading inventory: {error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <InventoryHeader 
          totalCount={diamonds.length}
          onRefresh={handleRefresh}
          loading={loading}
          onAddDiamond={() => setShowAddForm(true)}
        />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-80">
            <div className="space-y-6">
              <InventorySearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <InventoryFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </aside>
          
          <main className="flex-1">
            <div className="space-y-4">
              <InventoryTable
                data={filteredDiamonds}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStoreToggle={handleStoreToggle}
              />
              
              <InventoryPagination
                currentPage={pagination.page}
                totalPages={Math.ceil(diamonds.length / pagination.limit)}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </main>
        </div>

        {/* Edit Diamond Form */}
        {editingDiamond && (
          <DiamondForm
            diamond={editingDiamond}
            isOpen={!!editingDiamond}
            onClose={() => setEditingDiamond(null)}
            onSave={updateDiamond}
            isLoading={crudLoading}
          />
        )}

        {/* Add Diamond Form */}
        {showAddForm && (
          <DiamondForm
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSave={async (data) => {
              // Handle add diamond logic here
              setShowAddForm(false);
              handleRefresh();
            }}
            isLoading={crudLoading}
          />
        )}
      </div>
    </Layout>
  );
}
