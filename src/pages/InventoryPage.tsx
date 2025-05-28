
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryTable, Diamond } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { api, apiEndpoints } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export default function InventoryPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching inventory data from backend...');
        
        // Fetch all diamonds from your backend
        const response = await api.get<any[]>(apiEndpoints.getAllStones());
        
        if (response.data) {
          console.log('Received diamonds:', response.data);
          
          // Convert backend data to frontend format
          const convertedDiamonds = convertDiamondsToInventoryFormat(response.data);
          setAllDiamonds(convertedDiamonds);
          
          // Apply pagination
          const itemsPerPage = 10;
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedDiamonds = convertedDiamonds.slice(startIndex, endIndex);
          
          setDiamonds(paginatedDiamonds);
          setTotalPages(Math.ceil(convertedDiamonds.length / itemsPerPage));
        } else {
          console.warn('No inventory data received');
          setDiamonds([]);
        }
      } catch (error) {
        console.error("Failed to fetch inventory data", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch inventory data.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchData();
    }
  }, [currentPage, filters, isAuthenticated, authLoading]);
  
  // Filter diamonds based on search query
  useEffect(() => {
    if (!searchQuery) {
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDiamonds(allDiamonds.slice(startIndex, endIndex));
      setTotalPages(Math.ceil(allDiamonds.length / itemsPerPage));
      return;
    }

    const filtered = allDiamonds.filter(diamond =>
      diamond.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diamond.shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diamond.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diamond.clarity.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDiamonds(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchQuery, allDiamonds, currentPage]);
  
  const handleEdit = (id: string, data: Partial<Diamond>) => {
    setDiamonds((prev) =>
      prev.map((diamond) => (diamond.id === id ? { ...diamond, ...data } : diamond))
    );
    
    setAllDiamonds((prev) =>
      prev.map((diamond) => (diamond.id === id ? { ...diamond, ...data } : diamond))
    );
    
    toast({
      title: "Diamond updated",
      description: `Stock #${data.stockNumber || ""} has been updated.`,
    });
  };
  
  const handleDelete = (id: string) => {
    setDiamonds((prev) => prev.filter((diamond) => diamond.id !== id));
    setAllDiamonds((prev) => prev.filter((diamond) => diamond.id !== id));
    
    toast({
      title: "Diamond deleted",
      description: "The diamond has been removed from your inventory.",
    });
  };
  
  const handleMarkAsSold = (id: string) => {
    const updateStatus = (diamonds: Diamond[]) =>
      diamonds.map((diamond) => 
        diamond.id === id ? { ...diamond, status: "Sold" } : diamond
      );
    
    setDiamonds(updateStatus);
    setAllDiamonds(updateStatus);
    
    toast({
      title: "Status updated",
      description: "The diamond has been marked as sold.",
    });
  };
  
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diamond-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your diamond inventory ({allDiamonds.length} total diamonds)
            </p>
          </div>
          
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Diamond
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by stock number, shape, color, clarity..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <InventoryFilters onFilterChange={handleFilterChange} />
        
        <InventoryTable
          data={diamonds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkAsSold={handleMarkAsSold}
          loading={loading}
        />
        
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </Layout>
  );
}
