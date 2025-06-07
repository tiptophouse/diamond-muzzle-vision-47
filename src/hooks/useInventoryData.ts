
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
    const userId = 2138564172;
    
    console.log('🔍 INVENTORY: Starting fetch with user ID:', userId);
    setLoading(true);
    setDebugInfo({ step: 'Starting fetch', userId });
    
    try {
      // Test multiple endpoints to see what works
      const endpoints = [
        `https://mazalbot.app/api/v1/get_all_stones?user_id=${userId}`,
        `https://mazalbot.app/api/v1/users/${userId}/inventory`,
        `https://mazalbot.app/api/v1/inventory/${userId}`,
      ];
      
      let responseData = null;
      let workingEndpoint = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 INVENTORY: Trying endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            mode: 'cors',
          });
          
          console.log(`🔍 INVENTORY: Response status for ${endpoint}:`, response.status);
          console.log(`🔍 INVENTORY: Response headers:`, Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ INVENTORY: Success with ${endpoint}:`, data);
            responseData = data;
            workingEndpoint = endpoint;
            break;
          } else {
            const errorText = await response.text();
            console.log(`❌ INVENTORY: Failed ${endpoint}:`, response.status, errorText);
          }
        } catch (fetchError) {
          console.log(`❌ INVENTORY: Network error for ${endpoint}:`, fetchError);
        }
      }
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Tested all endpoints',
        workingEndpoint,
        responseData,
        hasData: !!responseData
      }));
      
      if (!responseData) {
        // Try a simple test endpoint to check if server is reachable
        try {
          const testResponse = await fetch('https://mazalbot.app/api/v1/', {
            method: 'GET',
            mode: 'cors',
          });
          console.log('🔍 INVENTORY: Test root endpoint response:', testResponse.status);
          
          setDebugInfo(prev => ({ 
            ...prev, 
            testEndpointStatus: testResponse.status,
            serverReachable: testResponse.ok
          }));
        } catch (testError) {
          console.log('🔍 INVENTORY: Server unreachable:', testError);
          setDebugInfo(prev => ({ 
            ...prev, 
            serverReachable: false,
            testError: testError.message
          }));
        }
        
        toast({
          title: "❌ API Connection Failed",
          description: "Unable to connect to backend server. Check console for details.",
          variant: "destructive",
        });
        
        setAllDiamonds([]);
        setDiamonds([]);
        return;
      }
      
      // Process the response data
      const dataArray = Array.isArray(responseData) ? responseData : responseData.data || responseData.diamonds || [];
      
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
          sampleDiamond: convertedDiamonds[0]
        }));
        
        toast({
          title: `✅ ${convertedDiamonds.length} diamonds loaded`,
          description: `Successfully loaded from ${workingEndpoint}`,
        });
      } else {
        console.log('🔍 INVENTORY: No diamonds in response data');
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'No diamonds found',
          responseStructure: Object.keys(responseData || {})
        }));
        
        setAllDiamonds([]);
        setDiamonds([]);
        
        toast({
          title: "⚠️ No Inventory Data",
          description: "Server responded but no diamonds found for your account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 INVENTORY: Critical error:", error);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Critical error',
        error: error.message,
        errorStack: error.stack
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
      setDebugInfo({ step: 'Manual refresh triggered' });
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
