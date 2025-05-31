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

  const fetchData = async () => {
    if (!user?.id) {
      console.log('No authenticated user, skipping data fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching inventory data for user:', user.id);
      
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data) {
        console.log('Received diamonds from FastAPI:', response.data.length, 'total diamonds');
        
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        toast({
          title: "Report data loaded",
          description: `Found ${convertedDiamonds.length} diamonds.`,
        });
      }
    } catch (error) {
      console.error("Failed to fetch report data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch report data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchData();
    }
  }, [isAuthenticated, user?.id]);

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

  if (!isAuthenticated || authError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {authError || "Authentication required to view reports"}
            </p>
            <p className="text-slate-600">Please ensure you're accessing this app through Telegram.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 px-4 sm:px-6 pb-6">
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
