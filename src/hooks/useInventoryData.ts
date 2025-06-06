
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useInventoryData() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const [loading, setLoading] = useState(false);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  
  const fetchData = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, skipping data fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Fetching inventory data from FastAPI for user:', user.id);
    
    try {
      // Make API call to get_all_stones endpoint
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Successfully received diamonds from FastAPI:', response.data.length, 'total diamonds');
        
        // Convert backend data to frontend format
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('Converted diamonds for user', user.id, ':', convertedDiamonds.length, 'diamonds');
        
        // Update state with converted diamonds
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        // Show success toast
        if (convertedDiamonds.length > 0) {
          toast({
            title: "Inventory Loaded",
            description: `Found ${convertedDiamonds.length} diamonds in your inventory`,
          });
        } else {
          toast({
            title: "No Diamonds Found",
            description: "Your inventory appears to be empty",
            variant: "destructive",
          });
        }
      } else {
        console.warn('No valid data received from FastAPI');
        setAllDiamonds([]);
        setDiamonds([]);
        
        toast({
          title: "No Data",
          description: "No inventory data found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      
      // Set empty arrays on error
      setAllDiamonds([]);
      setDiamonds([]);
      
      toast({
        title: "Error Loading Inventory",
        description: "Failed to load your diamond inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isAuthenticated && user?.id) {
      console.log('Manually refreshing inventory data for user:', user.id);
      fetchData();
    }
  };

  // Fetch data when authentication is complete
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('Authentication complete, fetching inventory data...');
      fetchData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setAllDiamonds([]);
      setDiamonds([]);
    }
  }, [authLoading, isAuthenticated, user?.id]);

  return {
    loading: loading || authLoading,
    diamonds,
    setDiamonds,
    allDiamonds,
    fetchData,
    handleRefresh,
  };
}
