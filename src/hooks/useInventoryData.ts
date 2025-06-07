
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useInventoryData() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const [loading, setLoading] = useState(false);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const fetchData = async () => {
    const userId = getCurrentUserId() || 2138564172;
    
    console.log('🔍 INVENTORY: Starting fetch with user ID:', userId);
    setLoading(true);
    setDebugInfo({ step: 'Starting fetch', userId, timestamp: new Date().toISOString() });
    
    try {
      console.log('🔍 INVENTORY: Using API client to fetch data');
      const result = await api.get(apiEndpoints.getAllStones(userId));
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'API call completed',
        hasError: !!result.error,
        hasData: !!result.data,
        timestamp: new Date().toISOString()
      }));
      
      if (result.error) {
        console.error('🔍 INVENTORY: API error:', result.error);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'API error occurred',
          error: result.error,
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: "❌ API Error",
          description: `Failed to load inventory: ${result.error}`,
          variant: "destructive",
        });
        
        setAllDiamonds([]);
        setDiamonds([]);
        return;
      }
      
      if (!result.data) {
        console.log('🔍 INVENTORY: No data returned from API');
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'No data returned',
          timestamp: new Date().toISOString()
        }));
        
        setAllDiamonds([]);
        setDiamonds([]);
        
        toast({
          title: "⚠️ No Data",
          description: "No response data from server",
          variant: "destructive",
        });
        return;
      }
      
      // Process the response data
      const dataArray = Array.isArray(result.data) ? result.data : 
                       result.data.data || result.data.diamonds || 
                       (result.data.items ? result.data.items : []);
      
      console.log('🔍 INVENTORY: Processing response data:', {
        rawDataType: typeof result.data,
        isArray: Array.isArray(result.data),
        dataArrayLength: dataArray.length,
        sampleItem: dataArray[0]
      });
      
      if (dataArray && dataArray.length > 0) {
        console.log('🔍 INVENTORY: Processing', dataArray.length, 'diamonds');
        
        // Convert diamonds for display
        const convertedDiamonds = convertDiamondsToInventoryFormat(dataArray, userId);
        console.log('🔍 INVENTORY: Converted', convertedDiamonds.length, 'diamonds');
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Data processed successfully',
          totalDiamonds: convertedDiamonds.length,
          sampleDiamond: convertedDiamonds[0],
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: `✅ ${convertedDiamonds.length} diamonds loaded`,
          description: `Successfully loaded your inventory`,
        });
      } else {
        console.log('🔍 INVENTORY: No diamonds in response data');
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'No diamonds found',
          responseStructure: Object.keys(result.data || {}),
          timestamp: new Date().toISOString()
        }));
        
        setAllDiamonds([]);
        setDiamonds([]);
        
        toast({
          title: "⚠️ No Inventory Data",
          description: "Your inventory appears to be empty",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 INVENTORY: Critical error:", error);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Critical error',
        error: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      }));
      
      setAllDiamonds([]);
      setDiamonds([]);
      
      toast({
        title: "❌ System Error",
        description: `Critical error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeDiamondFromState = (diamondId: string) => {
    console.log('Optimistically removing diamond from state:', diamondId);
    setAllDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
    setDiamonds(prev => prev.filter(diamond => diamond.id !== diamondId));
  };

  const restoreDiamondToState = (diamond: Diamond) => {
    console.log('Restoring diamond to state:', diamond.id);
    setAllDiamonds(prev => [...prev, diamond]);
    setDiamonds(prev => [...prev, diamond]);
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
