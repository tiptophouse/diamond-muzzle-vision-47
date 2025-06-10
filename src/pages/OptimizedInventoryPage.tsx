
import { Layout } from "@/components/layout/Layout";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { EnhancedInventoryActions } from "@/components/inventory/EnhancedInventoryActions";
import { useOptimizedInventory } from "@/hooks/useOptimizedInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, TrendingUp, Eye, Package } from "lucide-react";

export default function OptimizedInventoryPage() {
  const {
    diamonds,
    loading,
    error,
    totalCount,
    refetch,
    addDiamond,
    updateDiamond,
    deleteDiamond,
    toggleStoreVisibility,
    uploadImage,
  } = useOptimizedInventory();

  const storeVisibleCount = diamonds.filter(d => d.store_visible).length;
  const totalValue = diamonds.reduce((sum, d) => sum + d.price, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <InventoryHeader />
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Diamonds</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Store Visible</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeVisibleCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
              <Gem className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${diamonds.length > 0 ? Math.round(totalValue / diamonds.length).toLocaleString() : '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Inventory Management</h2>
          <EnhancedInventoryActions
            isAddMode
            onAdd={addDiamond}
          />
        </div>

        {/* Inventory Table */}
        <InventoryTable
          data={diamonds}
          loading={loading}
          onEdit={(diamond) => updateDiamond(diamond.stockNumber, diamond)}
          onDelete={(diamondId) => {
            const diamond = diamonds.find(d => d.id === diamondId);
            return diamond ? deleteDiamond(diamond.stockNumber) : Promise.resolve();
          }}
          onStoreToggle={toggleStoreVisibility}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
