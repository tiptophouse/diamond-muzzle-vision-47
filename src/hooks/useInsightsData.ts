
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface MarketTrend {
  category: string;
  count: number;
  percentage: number;
}

export function useInsightsData() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [totalDiamonds, setTotalDiamonds] = useState(0);
  
  const fetchRealInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching real insights for user:', user.id);
      
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data) {
        const diamonds = response.data.filter(d => 
          d.owners?.includes(user.id) || d.owner_id === user.id
        );
        
        setTotalDiamonds(diamonds.length);
        
        // Calculate real market trends by shape
        const shapeMap = new Map<string, number>();
        diamonds.forEach(diamond => {
          if (diamond.shape) {
            shapeMap.set(diamond.shape, (shapeMap.get(diamond.shape) || 0) + 1);
          }
        });
        
        const trends: MarketTrend[] = Array.from(shapeMap.entries())
          .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / diamonds.length) * 100)
          }))
          .sort((a, b) => b.count - a.count);
        
        setMarketTrends(trends);
        
        toast({
          title: "Insights loaded",
          description: `Analyzed ${diamonds.length} diamonds in your inventory.`,
        });
      }
    } catch (error) {
      console.error("Failed to fetch insights", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load insights. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRealInsights();
    }
  }, [isAuthenticated, user]);

  return {
    loading,
    marketTrends,
    totalDiamonds,
    fetchRealInsights,
    isAuthenticated
  };
}
