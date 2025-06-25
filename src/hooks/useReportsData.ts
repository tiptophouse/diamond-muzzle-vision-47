
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useReportsData() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
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
      console.log('📊 Fetching inventory data with JWT authentication for user:', user.id);
      
      const response = await api.get<any[]>(apiEndpoints.getAllStones());
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        console.log('✅ Received diamonds from API:', response.data.length, 'total diamonds');
        
        // JWT authentication ensures we only get diamonds for the authenticated user
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('✅ Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        setRetryCount(0);
        
        if (convertedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `${convertedDiamonds.length} diamonds`,
            description: "Report data loaded",
          });
          
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
      }, 1000 * retryCount);
    } else {
      toast({
        variant: "destructive",
        title: "Max retries reached",
        description: "Please check your connection and try refreshing the page.",
      });
    }
  };

  return {
    loading,
    diamonds,
    setDiamonds,
    allDiamonds,
    dataError,
    retryCount,
    fetchData,
    handleRetry,
  };
}
