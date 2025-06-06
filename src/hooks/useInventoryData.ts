
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints, setCurrentUserId } from "@/lib/api";
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
      console.log('🔄 Fetching inventory data from get_all_stones endpoint for user:', user.id);
      
      // Set current user ID for API context
      setCurrentUserId(user.id);
      
      const response = await Promise.race([
        api.get<any[]>(apiEndpoints.getAllStones(user.id)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after 10 seconds')), 10000)
        )
      ]) as any;
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Received diamonds from get_all_stones:', response.data.length, 'total diamonds');
        
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('✅ Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        if (convertedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `${convertedDiamonds.length} diamonds loaded`,
            description: "Inventory data fetched successfully",
          });
          
          setTimeout(() => {
            toastInstance.dismiss();
          }, 3000);
        } else {
          console.log('ℹ️ No diamonds found for user:', user.id);
        }
      } else {
        console.warn('⚠️ No valid data received from get_all_stones endpoint');
        setAllDiamonds([]);
        setDiamonds([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch inventory from get_all_stones:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        variant: "destructive",
        title: "Failed to load inventory",
        description: errorMessage,
      });
      
      setAllDiamonds([]);
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  const removeDiamondFromState = (diamondId: string) => {
    console.log('🗑️ Removing diamond from state:', diamondId);
    setAllDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
    setDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
  };

  const restoreDiamondToState = (diamond: Diamond) => {
    console.log('🔄 Restoring diamond to state:', diamond.id);
    setAllDiamonds(prev => [...prev, diamond]);
    setDiamonds(prev => [...prev, diamond]);
  };

  const handleRefresh = () => {
    if (isAuthenticated && user?.id) {
      console.log('🔄 Manually refreshing inventory data for user:', user.id);
      fetchData();
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('🚀 Starting inventory data fetch for user:', user.id);
      const timer = setTimeout(() => {
        fetchData();
      }, 1000); // Small delay to ensure auth is fully ready
      
      return () => clearTimeout(timer);
    } else if (!authLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, clearing inventory data');
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
    removeDiamondFromState,
    restoreDiamondToState,
  };
}
