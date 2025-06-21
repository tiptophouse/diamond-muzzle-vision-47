
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
      console.log('📊 Fetching inventory data for user:', user.id);
      
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        console.log('✅ Received diamonds from API:', response.data.length, 'total diamonds');
        
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        
        // Ensure all Diamond properties are present
        const processedDiamonds: Diamond[] = convertedDiamonds.map(diamond => ({
          ...diamond,
          store_visible: diamond.store_visible ?? true,
          gem360Url: diamond.gem360Url || (diamond.certificateUrl?.includes('gem360') ? diamond.certificateUrl : undefined)
        }));
        
        console.log('✅ Converted diamonds for display:', processedDiamonds.length, 'diamonds for user', user.id);
        
        setAllDiamonds(processedDiamonds);
        setDiamonds(processedDiamonds);
        setRetryCount(0);
        
        if (processedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `${processedDiamonds.length} diamonds`,
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
