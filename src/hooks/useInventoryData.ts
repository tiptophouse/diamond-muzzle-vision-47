
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
  
  const fetchData = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('❌ User not authenticated, skipping data fetch');
      setLoading(false);
      return;
    }

    console.log('🚀 FETCHING DIAMONDS FOR USER:', {
      userId: user.id,
      userName: user.first_name,
      isAuthenticated,
      endpoint: apiEndpoints.getAllStones(user.id)
    });

    setLoading(true);
    try {
      const response = await Promise.race([
        api.get<any[]>(apiEndpoints.getAllStones(user.id)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 10000)
        )
      ]) as any;
      
      console.log('📡 RAW API RESPONSE:', {
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        userId: user.id,
        dataType: typeof response.data,
        firstItem: response.data?.[0]
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log('🔄 Converting diamonds for user:', user.id);
        
        // Convert backend data to frontend format
        const convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        
        console.log('💎 DIAMOND CONVERSION RESULTS:', {
          originalCount: response.data.length,
          convertedCount: convertedDiamonds.length,
          userId: user.id,
          sampleOriginal: response.data.slice(0, 2),
          sampleConverted: convertedDiamonds.slice(0, 2)
        });
        
        setAllDiamonds(convertedDiamonds);
        
        if (convertedDiamonds.length > 0) {
          toast({
            title: `✅ ${convertedDiamonds.length} diamonds loaded`,
            description: `Inventory loaded for user ${user.id}`,
          });
        } else {
          console.warn('⚠️ No diamonds found after conversion');
          toast({
            title: "⚠️ No diamonds found",
            description: `No diamonds found for user ${user.id}`,
            variant: "destructive"
          });
        }
      } else {
        console.warn('❌ Invalid API response format:', response);
        setAllDiamonds([]);
      }
    } catch (error) {
      console.error("💥 INVENTORY FETCH FAILED:", {
        error: error,
        userId: user.id,
        endpoint: apiEndpoints.getAllStones(user.id)
      });
      
      toast({
        title: "❌ Failed to load inventory",
        description: `Error loading diamonds for user ${user.id}: ${error}`,
        variant: "destructive"
      });
      
      setAllDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isAuthenticated && user?.id) {
      console.log('🔄 Manually refreshing inventory for user:', user.id);
      fetchData();
    } else {
      console.warn('⚠️ Cannot refresh - user not authenticated:', { user: user?.id, isAuthenticated });
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('🎯 Auth complete, fetching data for user:', user.id);
      const timer = setTimeout(() => {
        fetchData();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (!authLoading && !isAuthenticated) {
      console.log('❌ Auth complete but user not authenticated');
      setLoading(false);
    } else {
      console.log('⏳ Waiting for auth...', { authLoading, isAuthenticated, userId: user?.id });
    }
  }, [authLoading, isAuthenticated, user?.id]);

  return {
    loading: loading || authLoading,
    diamonds,
    setDiamonds,
    allDiamonds,
    fetchData,
    handleRefresh,
  };
}
