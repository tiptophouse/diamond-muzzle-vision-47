
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
    loading,
    diamonds,
    allDiamonds,
    handleRefresh,
  } = useInventoryData();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  } = useInventorySearch(allDiamonds, currentPage, filters);

  const { 
    addDiamond,
    updateDiamond, 
    deleteDiamond,
    isLoading: crudLoading 
  } = useInventoryCrud({
    onSuccess: handleRefresh,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<any>(null);

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

  if (loading && diamonds.length === 0) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading inventory...</p>
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
                onSubmit={handleSearch}
                allDiamonds={allDiamonds}
              />
              <InventoryFilters
                onFilterChange={setFilters}
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
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </main>
        </div>

        {/* Edit Diamond Form */}
        {editingDiamond && (
          <DiamondForm
            diamond={editingDiamond}
            open={!!editingDiamond}
            onClose={() => setEditingDiamond(null)}
            onSave={async (data) => {
              await updateDiamond(editingDiamond.id, data);
              setEditingDiamond(null);
            }}
            isLoading={crudLoading}
          />
        )}

        {/* Add Diamond Form */}
        {showAddForm && (
          <DiamondForm
            open={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSave={async (data) => {
              await addDiamond(data);
              setShowAddForm(false);
            }}
            isLoading={crudLoading}
          />
        )}
      </div>
    </Layout>
  );
}
