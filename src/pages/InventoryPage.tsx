
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { SimpleInventoryTable } from "@/components/inventory/SimpleInventoryTable";
import { SimpleInventorySearch } from "@/components/inventory/SimpleInventorySearch";
import { api } from "@/lib/api";

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

  const loadInventory = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Loading inventory for user:', user.id);
      
      const response = await api.get(`/api/v1/get_all_stones?user_id=${user.id}`);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const rawData = Array.isArray(response.data) ? response.data : [];
      
      // Convert to Diamond format
      const convertedDiamonds: Diamond[] = rawData.map((item: any) => ({
        id: item.id || `${Date.now()}-${Math.random()}`,
        stockNumber: item.stock_number || item.stockNumber || 'N/A',
        shape: item.shape || 'Round',
        carat: Number(item.weight || item.carat || 0),
        color: item.color || 'G',
        clarity: item.clarity || 'VS1',
        cut: item.cut || 'Excellent',
        price: Number(item.price_per_carat * item.weight) || Number(item.price) || 0,
        status: item.status || 'Available',
        imageUrl: item.picture || item.imageUrl
      }));

      setDiamonds(convertedDiamonds);
      
      toast({
        title: "✅ Success",
        description: `Loaded ${convertedDiamonds.length} diamonds`,
      });
      
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to load inventory. Please try again.",
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
        />
      </div>
    </Layout>
  );
}
