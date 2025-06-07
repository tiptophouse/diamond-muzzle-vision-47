
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
    console.log('🔍 INVENTORY: Backend URL: https://api.mazalbot.com');
    console.log('🔍 INVENTORY: Expected diamonds: 566');
    setLoading(true);
    setDebugInfo({ step: 'Starting fetch', userId, expectedCount: 566, timestamp: new Date().toISOString() });
    
    try {
      console.log('🔍 INVENTORY: Using API client to fetch data');
      const endpoint = apiEndpoints.getAllStones(userId);
      console.log('🔍 INVENTORY: Full endpoint URL: https://api.mazalbot.com' + endpoint);
      
      const result = await api.get(endpoint);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'API call completed',
        hasError: !!result.error,
        hasData: !!result.data,
        endpoint: endpoint,
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
          title: "❌ Backend Connection Error",
          description: `Failed to connect to api.mazalbot.com: ${result.error}`,
          variant: "destructive",
        });
        
        setAllDiamonds([]);
        setDiamonds([]);
        return;
      }
      
      if (!result.data) {
        console.log('🔍 INVENTORY: No data returned from backend');
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'No data returned from backend',
          timestamp: new Date().toISOString()
        }));
        
        setAllDiamonds([]);
        setDiamonds([]);
        
        toast({
          title: "⚠️ No Response Data",
          description: "Backend returned no data - check if user has inventory",
          variant: "destructive",
        });
        return;
      }
      
      // Process the response data with proper type checking
      let dataArray: any[] = [];
      
      if (Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (typeof result.data === 'object' && result.data !== null) {
        // Check for common data structure patterns
        const dataObj = result.data as Record<string, any>;
        if (Array.isArray(dataObj.data)) {
          dataArray = dataObj.data;
        } else if (Array.isArray(dataObj.diamonds)) {
          dataArray = dataObj.diamonds;
        } else if (Array.isArray(dataObj.items)) {
          dataArray = dataObj.items;
        } else if (Array.isArray(dataObj.stones)) {
          dataArray = dataObj.stones;
        }
      }
      
      console.log('🔍 INVENTORY: Processing response data:', {
        rawDataType: typeof result.data,
        isArray: Array.isArray(result.data),
        dataArrayLength: dataArray.length,
        expectedLength: 566,
        sampleItem: dataArray[0]
      });
      
      if (dataArray && dataArray.length > 0) {
        console.log('🔍 INVENTORY: SUCCESS! Processing', dataArray.length, 'diamonds (expected 566)');
        
        // Convert diamonds for display
        const convertedDiamonds = convertDiamondsToInventoryFormat(dataArray, userId);
        console.log('🔍 INVENTORY: Converted', convertedDiamonds.length, 'diamonds for display');
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'SUCCESS: Data processed',
          totalDiamonds: convertedDiamonds.length,
          expectedDiamonds: 566,
          backendResponse: dataArray.length,
          sampleDiamond: convertedDiamonds[0],
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: `✅ SUCCESS: ${convertedDiamonds.length} diamonds loaded`,
          description: `Connected to api.mazalbot.com and loaded your inventory!`,
        });
      } else {
        console.log('🔍 INVENTORY: Backend responded but no diamonds found in data');
        console.log('🔍 INVENTORY: Response structure:', result.data);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Backend responded but no diamonds found',
          responseStructure: result.data && typeof result.data === 'object' ? Object.keys(result.data) : [],
          fullResponse: result.data,
          timestamp: new Date().toISOString()
        }));
        
        setAllDiamonds([]);
        setDiamonds([]);
        
        toast({
          title: "⚠️ No Diamonds Found",
          description: "Connected to backend but found no diamonds for this user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 INVENTORY: Critical error connecting to backend:", error);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Critical backend connection error',
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }));
      
      setAllDiamonds([]);
      setDiamonds([]);
      
      toast({
        title: "❌ Backend Connection Failed",
        description: `Cannot connect to api.mazalbot.com: ${error instanceof Error ? error.message : String(error)}`,
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
