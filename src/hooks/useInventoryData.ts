
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

// Admin user ID - gets special treatment
const ADMIN_USER_ID = 2138564172;

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
      isAdmin: user.id === ADMIN_USER_ID,
      endpoint: apiEndpoints.getAllStones(user.id)
    });

    setLoading(true);
    try {
      const response = await Promise.race([
        api.get<any[]>(apiEndpoints.getAllStones(user.id)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 15000)
        )
      ]) as any;
      
      console.log('📡 RAW API RESPONSE:', {
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        userId: user.id,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        firstItem: response.data?.[0],
        sampleItems: response.data?.slice(0, 3)
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log('🔄 Processing diamonds for user:', user.id);
        
        // For admin user or if we get a lot of data, assume backend already filtered
        const shouldSkipFiltering = user.id === ADMIN_USER_ID || response.data.length > 100;
        
        // Convert backend data to frontend format
        let convertedDiamonds;
        if (shouldSkipFiltering) {
          console.log('👑 Admin user or large dataset - skipping frontend filtering');
          convertedDiamonds = convertDiamondsToInventoryFormat(response.data);
        } else {
          console.log('🔍 Regular user - applying user filtering');
          convertedDiamonds = convertDiamondsToInventoryFormat(response.data, user.id);
        }
        
        console.log('💎 DIAMOND CONVERSION RESULTS:', {
          originalCount: response.data.length,
          convertedCount: convertedDiamonds.length,
          userId: user.id,
          isAdmin: user.id === ADMIN_USER_ID,
          skippedFiltering: shouldSkipFiltering,
          sampleConverted: convertedDiamonds.slice(0, 3)
        });
        
        setAllDiamonds(convertedDiamonds);
        
        if (convertedDiamonds.length > 0) {
          toast({
            title: `✅ ${convertedDiamonds.length} diamonds loaded`,
            description: `Inventory loaded for user ${user.id}${user.id === ADMIN_USER_ID ? ' (Admin)' : ''}`,
          });
        } else {
          console.warn('⚠️ No diamonds found after conversion');
          toast({
            title: "⚠️ No diamonds found",
            description: `No diamonds found for user ${user.id}. Raw data count: ${response.data.length}`,
            variant: "destructive"
          });
        }
      } else {
        console.warn('❌ Invalid API response format:', response);
        setAllDiamonds([]);
        toast({
          title: "❌ Invalid data format",
          description: `API returned unexpected data format for user ${user.id}`,
          variant: "destructive"
        });
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
      }, 500); // Reduced delay
      
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
