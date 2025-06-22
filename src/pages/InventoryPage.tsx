
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
        title: "❌ Connection Error",
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

        {/* Enhanced Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>Connection Problem:</strong> {error}
                </div>
                
                {debugInfo?.analysis && (
                  <div className="bg-red-50 p-3 rounded border">
                    <p><strong>Issue:</strong> {debugInfo.analysis.issue}</p>
                    <p><strong>Solution:</strong> {debugInfo.analysis.recommendation}</p>
                  </div>
                )}
                
                {debugInfo && (
                  <details className="text-xs bg-red-50 p-2 rounded">
                    <summary className="cursor-pointer font-medium">🔍 Technical Details (Click to expand)</summary>
                    <div className="mt-2 space-y-2">
                      {debugInfo.primaryError && (
                        <div>
                          <strong>API Error:</strong> {debugInfo.primaryError}
                        </div>
                      )}
                      
                      {debugInfo.attemptedEndpoints && (
                        <div>
                          <strong>Attempted Endpoints:</strong>
                          <ul className="list-disc ml-4">
                            {debugInfo.attemptedEndpoints.map((endpoint: string, i: number) => (
                              <li key={i}><code>https://api.mazalbot.com{endpoint}</code></li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {debugInfo.userId && (
                        <div><strong>User ID:</strong> {debugInfo.userId}</div>
                      )}
                      
                      {debugInfo.timestamp && (
                        <div><strong>Error Time:</strong> {new Date(debugInfo.timestamp).toLocaleString()}</div>
                      )}
                      
                      <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                        <strong>💡 Quick Fixes:</strong>
                        <ul className="list-disc ml-4 mt-1">
                          <li>Check if https://api.mazalbot.com is accessible</li>
                          <li>Verify BACKEND_ACCESS_TOKEN in Supabase secrets</li>
                          <li>Confirm FastAPI server is running</li>
                          <li>Try refreshing the page</li>
                        </ul>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Debug Info */}
        {!error && debugInfo && debugInfo.validDiamonds !== undefined && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">✅ Connected to FastAPI Backend</span>
            </div>
            <div className="text-sm text-green-700 mt-2">
              Loaded {debugInfo.validDiamonds} diamonds • Filtered {debugInfo.filteredOut} invalid entries • 
              Success rate: {debugInfo.conversionRate}%
            </div>
          </div>
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
            toast({
              title: "✅ Deleted",
              description: "Diamond removed from inventory",
            });
          }}
        />
      </div>
    </Layout>
  );
}
