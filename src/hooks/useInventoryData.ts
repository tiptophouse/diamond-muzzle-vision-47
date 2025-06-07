
import { useEffect } from "react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { useInventoryProcessor } from "./inventory/useInventoryProcessor";
import { useInventoryState } from "./inventory/useInventoryState";

export function useInventoryData() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { processInventoryData, showSuccessToast, showErrorToast } = useInventoryProcessor();
  const {
    loading,
    setLoading,
    diamonds,
    setDiamonds,
    allDiamonds,
    debugInfo,
    setDebugInfo,
    updateDiamonds,
    clearDiamonds,
    removeDiamondFromState,
    restoreDiamondToState,
  } = useInventoryState();
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      const result = await fetchInventoryData();
      
      setDebugInfo(result.debugInfo);
      
      if (result.error) {
        console.error('🔍 INVENTORY: Data fetch failed:', result.error);
        showErrorToast(result.error);
        clearDiamonds();
        return;
      }
      
      if (result.data && result.data.length > 0) {
        const processedDiamonds = processInventoryData(result.data);
        updateDiamonds(processedDiamonds);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'SUCCESS: Data processed',
          totalDiamonds: processedDiamonds.length,
          sampleDiamond: processedDiamonds[0],
          timestamp: new Date().toISOString()
        }));
        
        showSuccessToast(processedDiamonds.length);
      } else {
        clearDiamonds();
        showErrorToast("No diamonds found in response", "⚠️ No Diamonds Found");
      }
    } catch (error) {
      console.error("🔍 INVENTORY: Unexpected error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Unexpected error',
        error: errorMessage,
        timestamp: new Date().toISOString()
      }));
      
      clearDiamonds();
      showErrorToast(errorMessage, "❌ System Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isAuthenticated && user?.id) {
      console.log('🔍 INVENTORY: Manual refresh triggered for verified user:', user.id);
      setDebugInfo({ step: 'Manual refresh triggered', timestamp: new Date().toISOString() });
      fetchData();
    }
  };

  useEffect(() => {
    console.log('🔍 INVENTORY: useEffect triggered');
    
    const timer = setTimeout(() => {
      console.log('🔍 INVENTORY: Timer executed, calling fetchData');
      fetchData();
    }, 1000);
    
    return () => {
      console.log('🔍 INVENTORY: Cleaning up timer');
      clearTimeout(timer);
    };
  }, []);

  return {
    loading: loading || authLoading,
    diamonds,
    setDiamonds,
    allDiamonds,
    fetchData,
    handleRefresh,
    removeDiamondFromState,
    restoreDiamondToState,
    debugInfo,
  };
}
