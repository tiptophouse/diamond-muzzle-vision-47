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
    // Force the specific user ID for testing
    const userId = 2138564172;
    
    console.log('🔍 INVENTORY: Starting fetch with FORCED user ID:', userId);
    setLoading(true);
    
    try {
      const endpoint = apiEndpoints.getAllStones(userId);
      const fullUrl = `https://mazalbot.app/api/v1${endpoint}`;
      
      console.log('🔍 INVENTORY: API endpoint:', endpoint);
      console.log('🔍 INVENTORY: Full API URL:', fullUrl);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Making direct fetch to FastAPI backend', 
        endpoint,
        fullUrl,
        userId: userId,
        userIdType: typeof userId
      }));
      
      // Try direct fetch first with detailed error handling
      let response;
      try {
        console.log('🔍 INVENTORY: Making direct fetch request...');
        const fetchResponse = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        console.log('🔍 INVENTORY: Direct fetch response status:', fetchResponse.status);
        console.log('🔍 INVENTORY: Direct fetch response headers:', Object.fromEntries(fetchResponse.headers.entries()));
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('🔍 INVENTORY: Direct fetch failed:', fetchResponse.status, errorText);
          throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
        }
        
        const responseData = await fetchResponse.json();
        console.log('🔍 INVENTORY: Direct fetch response data:', responseData);
        
        // Wrap in expected format if needed
        response = Array.isArray(responseData) ? { data: responseData } : responseData;
      } catch (fetchError) {
        console.error('🔍 INVENTORY: Direct fetch failed, trying api.get...', fetchError);
        
        // Fallback to api.get method
        response = await api.get<any[]>(endpoint);
      }
      
      console.log('🔍 INVENTORY: Final response:', response);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Response received', 
        response,
        responseType: typeof response,
        responseKeys: Object.keys(response || {})
      }));
      
      if (response?.error) {
        console.error('🔍 INVENTORY: API returned error:', response.error);
        setDebugInfo(prev => ({ ...prev, error: response.error, step: 'API error' }));
        toast({
          title: "API Error",
          description: response.error,
          variant: "destructive",
        });
        setAllDiamonds([]);
        setDiamonds([]);
        return;
      }
      
      const dataToProcess = response?.data || response;
      
      if (dataToProcess && Array.isArray(dataToProcess)) {
        console.log('🔍 INVENTORY: Processing data');
        console.log('🔍 INVENTORY: Data count:', dataToProcess.length);
        console.log('🔍 INVENTORY: Sample data:', dataToProcess.slice(0, 2));
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Processing data', 
          rawDataCount: dataToProcess.length,
          sampleRawData: dataToProcess.slice(0, 2)
        }));
        
        // Convert diamonds for display
        const convertedDiamonds = convertDiamondsToInventoryFormat(dataToProcess, userId);
        console.log('🔍 INVENTORY: Converted diamonds count:', convertedDiamonds.length);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Data converted successfully', 
          convertedCount: convertedDiamonds.length,
          sampleConverted: convertedDiamonds[0]
        }));
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        toast({
          title: `✅ ${convertedDiamonds.length} diamonds loaded`,
          description: "Inventory data successfully fetched",
        });
      } else {
        console.warn('🔍 INVENTORY: No valid data in response');
        setDebugInfo(prev => ({ 
          ...prev, 
          error: 'No valid data in response', 
          step: 'No data received'
        }));
        setDiamonds([]);
        setAllDiamonds([]);
        
        toast({
          title: "⚠️ No Data",
          description: "No inventory data received from backend",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 INVENTORY: Fetch failed:", error);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        error: error.message || 'Unknown error', 
        step: 'Request failed',
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }));
      
      setAllDiamonds([]);
      setDiamonds([]);
      
      toast({
        title: "❌ Connection Failed",
        description: `Failed to connect to backend: ${error.message || 'Network error'}`,
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
    
    // Always try to fetch data after a brief delay
    const timer = setTimeout(() => {
      console.log('🔍 INVENTORY: Timer executed, calling fetchData');
      fetchData();
    }, 1000);
    
    return () => {
      console.log('🔍 INVENTORY: Cleaning up timer');
      clearTimeout(timer);
    };
  }, []); // Remove dependency to avoid re-fetching

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
