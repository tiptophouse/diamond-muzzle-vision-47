
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
    try {
      console.log('Fetching inventory data from FastAPI for user:', user.id);
      
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data) {
        console.log('Received diamonds from FastAPI:', response.data.length, 'total diamonds');
        
        // Convert backend data to frontend format with authenticated user filtering
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(convertedDiamonds);
        
        // Show smaller, auto-dismissing toast
        if (convertedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `${convertedDiamonds.length} diamonds`,
            description: "Inventory loaded successfully",
          });
          
          setTimeout(() => {
            toastInstance.dismiss();
          }, 3000);
        }
      } else if (response.error) {
        console.error('API Error:', response.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
        setAllDiamonds([]);
        setDiamonds([]);
      } else {
        console.warn('No inventory data received from FastAPI');
        setDiamonds([]);
        setAllDiamonds([]);
      }
    } catch (error) {
      console.error("Inventory fetch failed:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load inventory data",
      });
      
      setAllDiamonds([]);
      setDiamonds([]);
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

  // Only fetch data when authentication is complete and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('Authentication complete, fetching inventory data');
      fetchData();
    } else if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, clearing loading state');
      setLoading(false);
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
