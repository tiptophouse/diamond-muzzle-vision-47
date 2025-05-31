
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";

export function useInventoryData() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching inventory data from FastAPI');
      
      // Use a test user ID that exists in your backend data
      const testUserId = 2138564172;
      
      // Fetch all diamonds from your FastAPI backend
      const response = await api.get<any[]>(apiEndpoints.getAllStones());
      
      if (response.data) {
        console.log('Received diamonds from FastAPI:', response.data.length, 'total diamonds');
        
        // Convert backend data to frontend format with user filtering
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, testUserId);
        console.log('Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', testUserId);
        
        setAllDiamonds(convertedDiamonds);
        
        toast({
          title: "Inventory loaded",
          description: `Found ${convertedDiamonds.length} diamonds in your inventory.`,
        });
      } else {
        console.warn('No inventory data received from FastAPI');
        setDiamonds([]);
        setAllDiamonds([]);
      }
    } catch (error) {
      console.error("Failed to fetch inventory data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch inventory data. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Manually refreshing inventory data...');
    fetchData();
  };

  return {
    loading,
    diamonds,
    setDiamonds,
    allDiamonds,
    fetchData,
    handleRefresh,
  };
}
