
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useInventoryData() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  
  const fetchData = async (showToast = true) => {
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, skipping data fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching inventory data from FastAPI for user:', user.id);
      
      // Use the authenticated user's ID
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data) {
        console.log('Received diamonds from FastAPI:', response.data.length, 'total diamonds');
        
        // Convert backend data to frontend format with authenticated user filtering
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(convertedDiamonds);
        
        // Show toast message only if requested and there are diamonds
        if (showToast && convertedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `${convertedDiamonds.length} diamonds`,
            description: "Inventory updated",
          });
          
          // Auto-dismiss after 2 seconds
          setTimeout(() => {
            toastInstance.dismiss();
          }, 2000);
        }
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

  const handleRefresh = async (silent = false) => {
    if (isAuthenticated && user?.id) {
      console.log('Manually refreshing inventory data for user:', user.id);
      await fetchData(!silent);
    }
  };

  // Optimistic delete function for immediate UI updates
  const removeFromState = (diamondId: string) => {
    console.log('Optimistically removing diamond from state:', diamondId);
    setAllDiamonds(prev => prev.filter(d => d.id !== diamondId));
    setDiamonds(prev => prev.filter(d => d.id !== diamondId));
  };

  // Only fetch data when authentication is complete and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      fetchData();
    } else if (!authLoading && !isAuthenticated) {
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
    removeFromState,
  };
}
