
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
      
      const response = await Promise.race([
        api.get<any[]>(apiEndpoints.getAllStones(user.id)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 5000)
        )
      ]) as any;
      
      if (response.data) {
        console.log('Received diamonds from FastAPI:', response.data.length, 'total diamonds');
        
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(convertedDiamonds);
        
        if (convertedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `${convertedDiamonds.length} diamonds`,
            description: "Inventory loaded",
          });
          
          setTimeout(() => {
            toastInstance.dismiss();
          }, 3000);
        }
      } else {
        console.warn('No inventory data received from FastAPI');
        setDiamonds([]);
        setAllDiamonds([]);
      }
    } catch (error) {
      console.warn("Inventory fetch failed, using fallback:", error);
      setAllDiamonds([]);
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  const removeDiamondFromState = (diamondId: string) => {
    console.log('Removing diamond from state:', diamondId);
    setAllDiamonds(prev => {
      const filtered = prev.filter(diamond => diamond.id !== diamondId);
      console.log('AllDiamonds before removal:', prev.length, 'after removal:', filtered.length);
      return filtered;
    });
    setDiamonds(prev => {
      const filtered = prev.filter(diamond => diamond.id !== diamondId);
      console.log('Diamonds before removal:', prev.length, 'after removal:', filtered.length);
      return filtered;
    });
  };

  const restoreDiamondToState = (diamond: Diamond) => {
    console.log('Restoring diamond to state:', diamond.id);
    setAllDiamonds(prev => [...prev, diamond]);
    setDiamonds(prev => [...prev, diamond]);
  };

  const handleRefresh = () => {
    if (isAuthenticated && user?.id) {
      console.log('Manually refreshing inventory data for user:', user.id);
      fetchData();
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      const timer = setTimeout(() => {
        fetchData();
      }, 2500);
      
      return () => clearTimeout(timer);
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
    removeDiamondFromState,
    restoreDiamondToState,
  };
}
