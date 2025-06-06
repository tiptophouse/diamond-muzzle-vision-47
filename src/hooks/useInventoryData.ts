
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
    if (!isAuthenticated || !user?.id) {
      console.log('🔍 DEBUG: User not authenticated, skipping data fetch');
      console.log('🔍 DEBUG: isAuthenticated:', isAuthenticated);
      console.log('🔍 DEBUG: user:', user);
      setDebugInfo({ error: 'User not authenticated', isAuthenticated, user });
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('🔍 DEBUG: Starting inventory fetch for user:', user.id);
    
    try {
      const endpoint = apiEndpoints.getAllStones(user.id);
      console.log('🔍 DEBUG: API endpoint:', endpoint);
      console.log('🔍 DEBUG: Full API URL:', `https://api.mazalbot.com/api/v1${endpoint}`);
      
      setDebugInfo(prev => ({ ...prev, step: 'Making API request', endpoint }));
      
      const response = await Promise.race([
        api.get<any[]>(endpoint),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after 10 seconds')), 10000)
        )
      ]) as any;
      
      console.log('🔍 DEBUG: Raw API response:', response);
      setDebugInfo(prev => ({ ...prev, step: 'API response received', response }));
      
      if (response.error) {
        console.error('🔍 DEBUG: API returned error:', response.error);
        setDebugInfo(prev => ({ ...prev, error: response.error }));
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
        console.log('🔍 DEBUG: Received diamonds from FastAPI:', response.data.length, 'total diamonds');
        console.log('🔍 DEBUG: Sample diamond data:', response.data.slice(0, 3));
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Converting diamonds', 
          rawDataCount: response.data.length,
          sampleData: response.data.slice(0, 3)
        }));
        
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        console.log('🔍 DEBUG: Converted diamonds for display:', convertedDiamonds.length, 'diamonds for user', user.id);
        console.log('🔍 DEBUG: Sample converted diamond:', convertedDiamonds[0]);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Diamonds converted', 
          convertedCount: convertedDiamonds.length,
          sampleConverted: convertedDiamonds[0]
        }));
        
        setAllDiamonds(convertedDiamonds);
        setDiamonds(convertedDiamonds);
        
        if (convertedDiamonds.length > 0) {
          const toastInstance = toast({
            title: `✅ ${convertedDiamonds.length} diamonds loaded`,
            description: "Inventory data successfully fetched",
          });
          
          setTimeout(() => {
            toastInstance.dismiss();
          }, 3000);
        } else {
          toast({
            title: "⚠️ No diamonds found",
            description: `No diamonds found for user ${user.id}`,
            variant: "destructive",
          });
        }
      } else {
        console.warn('🔍 DEBUG: No inventory data received from FastAPI');
        console.log('🔍 DEBUG: Response structure:', Object.keys(response));
        setDebugInfo(prev => ({ ...prev, error: 'No data in response', responseKeys: Object.keys(response) }));
        setDiamonds([]);
        setAllDiamonds([]);
        
        toast({
          title: "⚠️ No Data",
          description: "No inventory data received from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 DEBUG: Inventory fetch failed:", error);
      setDebugInfo(prev => ({ ...prev, error: error.message || 'Unknown error', step: 'Error occurred' }));
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
      console.log('🔍 DEBUG: Manually refreshing inventory data for user:', user.id);
      setDebugInfo({ step: 'Manual refresh triggered' });
      fetchData();
    }
  };

  useEffect(() => {
    console.log('🔍 DEBUG: useEffect triggered - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'user.id:', user?.id);
    
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('🔍 DEBUG: Starting fetch timer...');
      const timer = setTimeout(() => {
        console.log('🔍 DEBUG: Timer executed, calling fetchData');
        fetchData();
      }, 1000); // Reduced delay for faster debugging
      
      return () => {
        console.log('🔍 DEBUG: Cleaning up timer');
        clearTimeout(timer);
      };
    } else if (!authLoading && !isAuthenticated) {
      console.log('🔍 DEBUG: Not authenticated, setting loading to false');
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
    debugInfo, // Add debug info to return
  };
}
