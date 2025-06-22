
import { useEffect, useState } from "react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { fetchEnhancedInventoryData, EnhancedFetchResult } from "@/services/enhancedInventoryService";
import { useInventoryProcessor } from "./inventory/useInventoryProcessor";
import { useInventoryState } from "./inventory/useInventoryState";
import { useInventoryDataSync } from "./inventory/useInventoryDataSync";
import { setCurrentUserId } from "@/lib/api";

export function useEnhancedInventoryData() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const { processInventoryData, showSuccessToast, showErrorToast } = useInventoryProcessor();
  const { subscribeToInventoryChanges } = useInventoryDataSync();
  const [lastFetchResult, setLastFetchResult] = useState<EnhancedFetchResult | null>(null);
  
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
    console.log('🔄 ENHANCED: Fetching inventory data...');
    setLoading(true);
    
    try {
      // Ensure admin user ID is set
      if (user?.id === 2138564172) {
        setCurrentUserId(user.id);
        console.log('🔧 ENHANCED: Admin user detected, setting current user ID');
      }
      
      const result = await fetchEnhancedInventoryData();
      setLastFetchResult(result);
      
      setDebugInfo({
        ...result.debugInfo,
        diagnostics: result.diagnostics,
        dataSource: result.dataSource
      });
      
      if (result.error) {
        console.error('🔍 ENHANCED: Data fetch failed:', result.error);
        showErrorToast(result.error);
        clearDiamonds();
        return;
      }
      
      if (result.data && result.data.length > 0) {
        const processedDiamonds = processInventoryData(result.data);
        updateDiamonds(processedDiamonds);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'SUCCESS: Enhanced data processed',
          totalDiamonds: processedDiamonds.length,
          sampleDiamond: processedDiamonds[0],
          dataSource: result.dataSource
        }));
        
        // Show appropriate success message based on data source
        if (result.dataSource === 'fastapi') {
          showSuccessToast(processedDiamonds.length);
          console.log('✅ ENHANCED: Real FastAPI data loaded with', processedDiamonds.length, 'diamonds');
        } else {
          showErrorToast(
            `Using ${result.dataSource} data. Check FastAPI connection for real inventory.`,
            `⚠️ ${result.dataSource.toUpperCase()} Data`
          );
        }
      } else {
        clearDiamonds();
        showErrorToast("No diamonds found in response", "⚠️ No Diamonds Found");
        console.log('⚠️ ENHANCED: No diamonds found in API response');
      }
    } catch (error) {
      console.error("🔍 ENHANCED: Unexpected error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setDebugInfo({ 
        step: 'Unexpected error in enhanced fetch',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      clearDiamonds();
      showErrorToast(errorMessage, "❌ System Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔍 ENHANCED: Manual refresh triggered for admin user');
    setDebugInfo({ step: 'Manual enhanced refresh triggered', timestamp: new Date().toISOString() });
    fetchData();
  };

  const handleStoreToggle = (stockNumber: string, isVisible: boolean) => {
    setDiamonds(prevDiamonds => 
      prevDiamonds.map(diamond => 
        diamond.stockNumber === stockNumber 
          ? { ...diamond, store_visible: isVisible }
          : diamond
      )
    );
  };

  // Subscribe to inventory changes from other components
  useEffect(() => {
    const unsubscribe = subscribeToInventoryChanges(() => {
      console.log('🔄 ENHANCED: Inventory change detected, refreshing enhanced data...');
      fetchData();
    });

    return unsubscribe;
  }, [subscribeToInventoryChanges]);

  useEffect(() => {
    console.log('🔍 ENHANCED: useEffect triggered');
    
    const timer = setTimeout(() => {
      console.log('🔍 ENHANCED: Timer executed, calling enhanced fetchData');
      fetchData();
    }, 1000);
    
    return () => {
      console.log('🔍 ENHANCED: Cleaning up timer');
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
    handleStoreToggle,
    removeDiamondFromState,
    restoreDiamondToState,
    debugInfo,
    lastFetchResult, // New: expose fetch diagnostics
  };
}
