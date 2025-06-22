import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle, TestTube } from "lucide-react";
import { SimpleInventoryTable } from "@/components/inventory/SimpleInventoryTable";
import { SimpleInventorySearch } from "@/components/inventory/SimpleInventorySearch";
import { InventoryService } from "@/services/inventoryService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => navigate('/diagnostics')}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Diagnostics
            </Button>
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

        {/* Critical Security Alert */}
        {debugInfo?.criticalIssue && (
          <Alert variant="destructive" className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-bold text-red-800">
                  🚨 CRITICAL SECURITY ISSUE
                </div>
                <div className="text-red-700">
                  {debugInfo.criticalIssue}
                </div>
                <div className="bg-red-100 p-3 rounded border text-sm">
                  <strong>Immediate Action Required:</strong>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets</li>
                    <li>Generate a new backend access token</li>
                    <li>Update BACKEND_ACCESS_TOKEN secret</li>
                    <li>Revoke the old token from your FastAPI configuration</li>
                  </ol>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>FastAPI Connection Problem:</strong>
                  <div className="mt-1 whitespace-pre-line text-sm">
                    {error}
                  </div>
                </div>
                
                {debugInfo?.diagnostic && (
                  <div className="bg-red-50 p-3 rounded border">
                    <p><strong>Status Code:</strong> {debugInfo.diagnostic.statusCode || 'No Response'}</p>
                    {debugInfo.diagnostic.statusCode === 404 && (
                      <p className="text-sm mt-1">The endpoint /api/v1/get_all_stones was not found on your FastAPI server.</p>
                    )}
                    {debugInfo.diagnostic.statusCode === 403 && (
                      <p className="text-sm mt-1">Access forbidden. The backend token may be invalid or expired.</p>
                    )}
                    {debugInfo.diagnostic.statusCode === 401 && (
                      <p className="text-sm mt-1">Authentication failed. Check your backend token configuration.</p>
                    )}
                  </div>
                )}
                
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  <strong>💡 Quick Actions:</strong>
                  <div className="mt-2 space-y-1">
                    <Button
                      onClick={() => navigate('/diagnostics')}
                      size="sm"
                      variant="outline"
                      className="mr-2"
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      Run Full Diagnostic
                    </Button>
                    <div className="text-xs text-blue-700 mt-2">
                      Run diagnostics to get detailed connection analysis and Python test commands.
                    </div>
                  </div>
                </div>
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
            {debugInfo.criticalIssue && (
              <div className="text-xs text-orange-700 mt-1 font-medium">
                ⚠️ Security: Backend token rotation still required
              </div>
            )}
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
