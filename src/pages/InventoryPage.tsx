
import { Layout } from "@/components/layout/Layout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventorySidebar } from "@/components/inventory/InventorySidebar";
import { InventoryMainContent } from "@/components/inventory/InventoryMainContent";
import { InventoryModal } from "@/components/inventory/InventoryModal";
import { useInventoryPageLogic } from "@/hooks/useInventoryPageLogic";

export default function InventoryPage() {
  const {
    // Data
    loading,
    allDiamonds,
    filteredDiamonds,
    totalPages,
    currentPage,
    searchQuery,
    showAddForm,
    editingDiamond,
    crudLoading,
    
    // Actions
    handleRefresh,
    setCurrentPage,
    setFilters,
    setSearchQuery,
    handleSearch,
    handleEdit,
    handleDelete,
    handleStoreToggle,
    handleEditSubmit,
    handleAddSubmit,
    handleAddDiamond,
    setShowAddForm,
    setEditingDiamond,
  } = useInventoryPageLogic();

  if (loading && allDiamonds.length === 0) {
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
          totalCount={allDiamonds.length}
          onRefresh={handleRefresh}
          loading={loading}
          onAddDiamond={handleAddDiamond}
        />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <InventorySidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
            allDiamonds={allDiamonds}
            onFilterChange={setFilters}
          />
          
          <InventoryMainContent
            filteredDiamonds={filteredDiamonds}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStoreToggle={handleStoreToggle}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Edit Diamond Modal */}
        <InventoryModal
          isOpen={!!editingDiamond}
          onClose={() => setEditingDiamond(null)}
          title={`Edit Diamond - #${editingDiamond?.stockNumber}`}
          diamond={editingDiamond}
          onSubmit={handleEditSubmit}
          isLoading={crudLoading}
        />

        {/* Add Diamond Modal */}
        <InventoryModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          title="Add New Diamond"
          onSubmit={handleAddSubmit}
          isLoading={crudLoading}
        />
      </div>
    </Layout>
  );
}
