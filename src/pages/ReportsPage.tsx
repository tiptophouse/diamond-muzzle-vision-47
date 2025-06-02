
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventorySearch } from "@/hooks/useInventorySearch";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  const { isAuthenticated, isLoading: authLoading, user, error: authError } = useTelegramAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [dataError, setDataError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    if (!user?.id) {
      console.log('⚠️ No authenticated user, skipping data fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    setDataError(null);
    
    try {
      console.log('📊 Fetching inventory data for user:', user.id);
      
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        console.log('✅ Received diamonds from API:', response.data.length, 'total diamonds');
        
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('✅ Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        setRetryCount(0); // Reset retry count on success
        
        // Show smaller, less intrusive toast message
        if (convertedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `${convertedDiamonds.length} diamonds`,
            description: "Report data loaded",
          });
          
          // Auto-dismiss after 3 seconds
          setTimeout(() => {
            toastInstance.dismiss();
          }, 3000);
        }
      } else {
        console.warn('⚠️ No data received from API');
        setAllDiamonds([]);
        setDiamonds([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch report data", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setDataError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      console.log(`🔄 Retrying data fetch (attempt ${retryCount + 1}/3)`);
      setTimeout(() => {
        fetchData();
      }, 1000 * retryCount); // Exponential backoff
    } else {
      toast({
        variant: "destructive",
        title: "Max retries reached",
        description: "Please check your connection and try refreshing the page.",
      });
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      fetchData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    // Implement search and filter logic here
    const filtered = allDiamonds.filter((diamond) => {
      // Search logic
      const searchRegex = new RegExp(searchQuery, "i");
      const searchMatch =
        searchQuery === "" ||
        Object.values(diamond).some((value) =>
          String(value).match(searchRegex)
        );

      // Filter logic
      const filterMatch = Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // Skip empty filters
        return String(diamond[key as keyof Diamond])
          .toLowerCase()
          .includes(value.toLowerCase());
      });

      return searchMatch && filterMatch;
    });

    // Pagination
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedDiamonds = filtered.slice(startIndex, endIndex);

    setDiamonds(paginatedDiamonds);
    setTotalPages(Math.ceil(filtered.length / 10));
  }, [allDiamonds, currentPage, filters, searchQuery]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Auth loading state
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Authenticating...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Auth error state
  if (!isAuthenticated || authError) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Authentication Error</CardTitle>
              <CardDescription>
                {authError || "Authentication required to view reports"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please ensure you're accessing this app through Telegram.
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Data error state
  if (dataError && !loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-600">Data Loading Error</CardTitle>
              <CardDescription>
                Failed to load report data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                {dataError}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1" disabled={retryCount >= 3}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry ({3 - retryCount} left)
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 px-4 sm:px-6 pb-6">
        <InventoryHeader
          totalDiamonds={allDiamonds.length}
          onRefresh={fetchData}
          loading={loading}
        />
        
        <div className="space-y-4">
          <InventorySearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearch}
            allDiamonds={allDiamonds}
          />
          
          <InventoryFilters onFilterChange={handleFilterChange} />
        </div>
        
        <InventoryTable
          data={diamonds}
          loading={loading}
        />
        
        <InventoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
}
