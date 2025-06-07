import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints, setCurrentUserId } from "@/lib/api";
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
    if (!isAuthenticated || !user?.id) {
      console.log('🔍 INVENTORY: User not authenticated, skipping data fetch');
      console.log('🔍 INVENTORY: isAuthenticated:', isAuthenticated);
      console.log('🔍 INVENTORY: user:', user);
      setDebugInfo({ 
        error: 'User not authenticated', 
        isAuthenticated, 
        user,
        step: 'Authentication check failed'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('🔍 INVENTORY: Starting fetch for user:', user.id, 'type:', typeof user.id);
    
    // Ensure user ID is set in API client
    setCurrentUserId(user.id);
    
    try {
      const endpoint = apiEndpoints.getAllStones(user.id);
      console.log('🔍 INVENTORY: API endpoint:', endpoint);
      console.log('🔍 INVENTORY: Full API URL:', `https://api.mazalbot.com/api/v1${endpoint}`);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'Making API request', 
        endpoint,
        userId: user.id,
        userIdType: typeof user.id
      }));
      
      const response = await Promise.race([
        api.get<any[]>(endpoint),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after 15 seconds')), 15000)
        )
      ]) as any;
      
      console.log('🔍 INVENTORY: Raw API response received');
      console.log('🔍 INVENTORY: Response type:', typeof response);
      console.log('🔍 INVENTORY: Response keys:', Object.keys(response));
      console.log('🔍 INVENTORY: Response:', response);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        step: 'API response received', 
        response,
        responseType: typeof response,
        responseKeys: Object.keys(response)
      }));
      
      if (response.error) {
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
      
      if (response.data) {
        console.log('🔍 INVENTORY: Processing data from FastAPI');
        console.log('🔍 INVENTORY: Data type:', typeof response.data);
        console.log('🔍 INVENTORY: Data is array:', Array.isArray(response.data));
        console.log('🔍 INVENTORY: Data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
        console.log('🔍 INVENTORY: Sample raw data:', response.data.slice ? response.data.slice(0, 3) : response.data);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Processing data', 
          rawDataCount: Array.isArray(response.data) ? response.data.length : 0,
          rawDataType: typeof response.data,
          sampleRawData: response.data.slice ? response.data.slice(0, 3) : response.data
        }));
        
        // Convert diamonds for display
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('🔍 INVENTORY: Converted diamonds for display');
        console.log('🔍 INVENTORY: Converted count:', convertedDiamonds.length);
        console.log('🔍 INVENTORY: Sample converted diamond:', convertedDiamonds[0]);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Data converted successfully', 
          convertedCount: convertedDiamonds.length,
          sampleConverted: convertedDiamonds[0],
          allRawData: response.data
        }));
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        if (convertedDiamonds.length > 0) {
          toast({
            title: `✅ ${convertedDiamonds.length} diamonds loaded`,
            description: "Inventory data successfully fetched",
          });
        } else {
          console.warn('🔍 INVENTORY: No diamonds after conversion - checking filtering logic');
          console.log('🔍 INVENTORY: User ID for filtering:', user.id);
          console.log('🔍 INVENTORY: Raw data sample for debugging:', response.data.slice(0, 5));
          
          toast({
            title: "⚠️ No diamonds found",
            description: `No diamonds found for user ${user.id}. Check filtering logic.`,
            variant: "destructive",
          });
        }
      } else {
        console.warn('🔍 INVENTORY: No data property in response');
        console.log('🔍 INVENTORY: Full response structure:', response);
        setDebugInfo(prev => ({ 
          ...prev, 
          error: 'No data property in response', 
          fullResponse: response,
          step: 'No data in response'
        }));
        setDiamonds([]);
        setAllDiamonds([]);
        
        toast({
          title: "⚠️ No Data",
          description: "No inventory data received from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 INVENTORY: Fetch failed with error:", error);
      console.error("🔍 INVENTORY: Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setDebugInfo(prev => ({ 
        ...prev, 
        error: error.message || 'Unknown error', 
        step: 'Error occurred',
        errorDetails: {
          message: error.message,
          name: error.name
        }
      }));
      setAllDiamonds([]);
      setDiamonds([]);
      
      toast({
        title: "❌ Fetch Failed",
        description: `Failed to load inventory: ${error.message || 'Unknown error'}`,
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
      console.log('🔍 INVENTORY: Manual refresh triggered for user:', user.id);
      setDebugInfo({ step: 'Manual refresh triggered' });
      fetchData();
    }
  };

  useEffect(() => {
    console.log('🔍 INVENTORY: useEffect triggered');
    console.log('🔍 INVENTORY: authLoading:', authLoading);
    console.log('🔍 INVENTORY: isAuthenticated:', isAuthenticated);
    console.log('🔍 INVENTORY: user:', user);
    console.log('🔍 INVENTORY: user.id:', user?.id, 'type:', typeof user?.id);
    
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('🔍 INVENTORY: Conditions met, starting fetch timer...');
      const timer = setTimeout(() => {
        console.log('🔍 INVENTORY: Timer executed, calling fetchData');
        fetchData();
      }, 1000);
      
      return () => {
        console.log('🔍 INVENTORY: Cleaning up timer');
        clearTimeout(timer);
      };
    } else if (!authLoading && !isAuthenticated) {
      console.log('🔍 INVENTORY: Not authenticated, setting loading to false');
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
    debugInfo,
  };
}
