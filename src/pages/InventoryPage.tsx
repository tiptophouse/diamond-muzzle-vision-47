
import { Layout } from "@/components/layout/Layout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { useEnhancedInventoryData } from "@/hooks/useEnhancedInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondForm } from "@/components/inventory/DiamondForm";
import { FastAPIDebugger } from "@/components/admin/FastAPIDebugger";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useState } from "react";
import { AlertTriangle, Database, Wifi } from "lucide-react";

const ADMIN_TELEGRAM_ID = 2138564172;

export default function InventoryPage() {
  const { user } = useTelegramAuth();
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID;

  const {
    loading,
    diamonds,
    allDiamonds,
    handleRefresh,
    debugInfo,
    lastFetchResult,
  } = useEnhancedInventoryData();

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
        storeVisible: isVisible
      });
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (editingDiamond) {
      await updateDiamond(editingDiamond.id, data);
      setEditingDiamond(null);
    }
  };

  const handleAddSubmit = async (data: any) => {
    await addDiamond(data);
    setShowAddForm(false);
  };

  const getDataSourceBadge = () => {
    if (!lastFetchResult) return null;
    
    const { dataSource } = lastFetchResult;
    const badgeConfig = {
      fastapi: { variant: 'default' as const, label: '✅ Real Data', icon: Database },
      localStorage: { variant: 'secondary' as const, label: '💾 Backup Data', icon: Database },
      mock: { variant: 'destructive' as const, label: '⚠️ Sample Data', icon: AlertTriangle }
    };
    
    const config = badgeConfig[dataSource];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading && diamonds.length === 0) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading your diamond inventory...</p>
          {isAdmin && (
            <p className="text-sm text-blue-600 mt-2">Admin mode: Connecting to FastAPI backend...</p>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Admin Debug Panel */}
        {isAdmin && (
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-900">Admin Connection Status</CardTitle>
                  </div>
                  {getDataSourceBadge()}
                </div>
                <CardDescription className="text-blue-700">
                  You're logged in as Admin (ID: {user?.id}). 
                  {lastFetchResult?.dataSource === 'fastapi' 
                    ? ' Successfully connected to your FastAPI backend!' 
                    : ' Connection to FastAPI failed - troubleshooting below.'}
                </CardDescription>
              </CardHeader>
              {lastFetchResult?.diagnostics && (
                <CardContent className="pt-0">
                  <div className="text-sm space-y-1">
                    {lastFetchResult.diagnostics.slice(-3).map((diagnostic, index) => (
                      <div key={index} className="text-blue-700">• {diagnostic}</div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
            
            {lastFetchResult?.dataSource !== 'fastapi' && (
              <FastAPIDebugger />
            )}
          </div>
        )}

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

        {/* Edit Diamond Modal */}
        <Dialog open={!!editingDiamond} onOpenChange={() => setEditingDiamond(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Diamond</DialogTitle>
            </DialogHeader>
            {editingDiamond && (
              <DiamondForm
                diamond={editingDiamond}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingDiamond(null)}
                isLoading={crudLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Diamond Modal */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Diamond</DialogTitle>
            </DialogHeader>
            <DiamondForm
              onSubmit={handleAddSubmit}
              onCancel={() => setShowAddForm(false)}
              isLoading={crudLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
