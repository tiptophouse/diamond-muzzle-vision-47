
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { SimpleInventoryTable } from "@/components/inventory/SimpleInventoryTable";
import { SimpleInventorySearch } from "@/components/inventory/SimpleInventorySearch";
import { InventoryService } from "@/services/inventoryService";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface Diamond {
  id: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
}

export default function InventoryPage() {
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const loadInventory = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading inventory for user:', user.id);
      
      const result = await InventoryService.fetchInventory(user.id);
      
      setDebugInfo(result.debugInfo);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      const inventoryData = result.data || [];
      setDiamonds(inventoryData);
      
      toast({
        title: "✅ Success",
        description: `Loaded ${inventoryData.length} diamonds successfully`,
      });
      
      console.log('✅ Inventory loaded successfully:', {
        count: inventoryData.length,
        sample: inventoryData[0]
      });
      
    } catch (error) {
      console.error('❌ Failed to load inventory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load inventory';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadInventory();
    }
  }, [isAuthenticated, user?.id]);

  const filteredDiamonds = diamonds.filter(diamond =>
    diamond.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    diamond.shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
    diamond.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
    diamond.clarity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Please authenticate to view your inventory.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Diamond Inventory</h1>
            <p className="text-gray-600">Manage your diamond collection</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadInventory}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Diamond
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {debugInfo && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer">Debug Information</summary>
                  <pre className="mt-1 overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <SimpleInventorySearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={diamonds.length}
        />

        {/* Table */}
        <SimpleInventoryTable
          diamonds={filteredDiamonds}
          loading={loading}
          onRefresh={loadInventory}
          onDiamondDeleted={(deletedId) => {
            setDiamonds(prev => prev.filter(d => d.id !== deletedId));
          }}
        />
      </div>
    </Layout>
  );
}
