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
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const fetchData = async () => {
    // Always try to fetch data if we have any user or fallback to hardcoded ID
    const userId = user?.id || getCurrentUserId() || 2138564172;
    
    console.log('🔍 INVENTORY: Starting fetch with user ID:', userId);
    setLoading(true);
    
    try {
      const endpoint = apiEndpoints.getAllStones(userId);
      console.log('🔍 INVENTORY: API endpoint:', endpoint);
      console.log('🔍 INVENTORY: Full API URL:', `https://mazalbot.app/api/v1${endpoint}`);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Making API request to FastAPI backend', 
        endpoint,
        userId: userId,
        userIdType: typeof userId
      }));
      
      const response = await Promise.race([
        api.get<any[]>(endpoint),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after 15 seconds')), 15000)
        )
      ]) as any;
      
      console.log('🔍 INVENTORY: FastAPI response received');
      console.log('🔍 INVENTORY: Response:', response);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'FastAPI response received', 
        response,
        responseType: typeof response,
        responseKeys: Object.keys(response)
      }));
      
      if (response.error) {
        console.error('🔍 INVENTORY: FastAPI returned error:', response.error);
        setDebugInfo(prev => ({ ...prev, error: response.error, step: 'FastAPI error' }));
        toast({
          title: "API Error",
          description: response.error,
          variant: "destructive",
        });
        setAllDiamonds([]);
        setDiamonds([]);
        return;
      }
      
      if (response.data) {
        console.log('🔍 INVENTORY: Processing data from FastAPI');
        console.log('🔍 INVENTORY: Data type:', typeof response.data);
        console.log('🔍 INVENTORY: Data is array:', Array.isArray(response.data));
        console.log('🔍 INVENTORY: Data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Processing FastAPI data', 
          rawDataCount: Array.isArray(response.data) ? response.data.length : 0,
          sampleRawData: response.data.slice ? response.data.slice(0, 2) : response.data
        }));
        
        // Convert diamonds for display
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, userId);
        console.log('🔍 INVENTORY: Converted diamonds for display');
        console.log('🔍 INVENTORY: Converted count:', convertedDiamonds.length);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Data converted successfully', 
          convertedCount: convertedDiamonds.length,
          sampleConverted: convertedDiamonds[0]
        }));
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        if (convertedDiamonds.length > 0) {
          toast({
            title: `✅ ${convertedDiamonds.length} diamonds loaded`,
            description: "Inventory data successfully fetched from FastAPI",
          });
        } else {
          toast({
            title: "⚠️ No diamonds found",
            description: `No diamonds found for user ${userId} in FastAPI backend`,
            variant: "destructive",
          });
        }
      } else {
        console.warn('🔍 INVENTORY: No data property in FastAPI response');
        setDebugInfo(prev => ({ 
          ...prev, 
          error: 'No data property in FastAPI response', 
          step: 'No data in FastAPI response'
        }));
        setDiamonds([]);
        setAllDiamonds([]);
        
        toast({
          title: "⚠️ No Data",
          description: "No inventory data received from FastAPI backend",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 INVENTORY: FastAPI fetch failed:", error);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        error: error.message || 'Unknown error', 
        step: 'FastAPI request failed'
      }));
      setAllDiamonds([]);
      setDiamonds([]);
      
      toast({
        title: "❌ FastAPI Connection Failed",
        description: `Failed to connect to FastAPI backend: ${error.message || 'Unknown error'}`,
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
    console.log('🔍 INVENTORY: authLoading:', authLoading);
    console.log('🔍 INVENTORY: user:', user);
    
    // Always try to fetch data after a brief delay, regardless of auth state
    const timer = setTimeout(() => {
      console.log('🔍 INVENTORY: Timer executed, calling fetchData');
      fetchData();
    }, 1000);
    
    return () => {
      console.log('🔍 INVENTORY: Cleaning up timer');
      clearTimeout(timer);
    };
  }, [user?.id]); // Only depend on user ID changes

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
