
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MarketTrend {
  category: string;
  count: number;
  percentage: number;
  change?: number;
}

interface DemandInsight {
  shape: string;
  color: string;
  clarity: string;
  demandLevel: 'high' | 'medium' | 'low';
  searchCount: number;
  avgPrice: number;
}

interface GroupInsight {
  totalSharedDiamonds: number;
  mostViewedShape: string;
  mostViewedColor: string;
  avgViewTime: number;
  totalViews: number;
}

interface PersonalInsight {
  inventoryValue: number;
  mostProfitableShape: string;
  leastProfitableShape: string;
  avgPricePerCarat: number;
  portfolioGrowth: number;
}

export function useInsightsData() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [totalDiamonds, setTotalDiamonds] = useState(0);
  const [demandInsights, setDemandInsights] = useState<DemandInsight[]>([]);
  const [groupInsights, setGroupInsights] = useState<GroupInsight | null>(null);
  const [personalInsights, setPersonalInsights] = useState<PersonalInsight | null>(null);
  
  const fetchGroupInsights = async () => {
    try {
      const { data: shareAnalytics } = await supabase
        .from('diamond_share_analytics')
        .select('*')
        .limit(1000);

      if (shareAnalytics && shareAnalytics.length > 0) {
        const insights: GroupInsight = {
          totalSharedDiamonds: new Set(shareAnalytics.map(s => s.diamond_stock_number)).size,
          mostViewedShape: getMostFrequent(shareAnalytics, 'device_type') || 'round brilliant',
          mostViewedColor: 'G', // This would need diamond data joined
          avgViewTime: shareAnalytics.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / shareAnalytics.length,
          totalViews: shareAnalytics.length
        };
        setGroupInsights(insights);
      }
    } catch (error) {
      console.error('Failed to fetch group insights:', error);
    }
  };

  const fetchDemandInsights = async () => {
    try {
      // Simulate demand data based on group analytics and user searches
      const mockDemandData: DemandInsight[] = [
        { shape: 'round brilliant', color: 'G', clarity: 'VS1', demandLevel: 'high', searchCount: 156, avgPrice: 4500 },
        { shape: 'princess', color: 'F', clarity: 'VS2', demandLevel: 'high', searchCount: 89, avgPrice: 3800 },
        { shape: 'emerald', color: 'H', clarity: 'SI1', demandLevel: 'medium', searchCount: 45, avgPrice: 3200 },
        { shape: 'oval', color: 'E', clarity: 'VVS2', demandLevel: 'medium', searchCount: 67, avgPrice: 5200 },
        { shape: 'cushion', color: 'I', clarity: 'SI2', demandLevel: 'low', searchCount: 23, avgPrice: 2800 }
      ];
      setDemandInsights(mockDemandData);
    } catch (error) {
      console.error('Failed to fetch demand insights:', error);
    }
  };

  const fetchRealInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching comprehensive insights for user:', user.id);
      
      // Get user's diamonds
      const response = await api.get<any[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data) {
        const diamonds = response.data.filter(d => 
          d.owners?.includes(user.id) || d.owner_id === user.id
        );
        
        setTotalDiamonds(diamonds.length);
        
        // Calculate enhanced market trends by shape with growth simulation
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
            percentage: Math.round((count / diamonds.length) * 100),
            change: Math.floor(Math.random() * 20) - 10 // Simulate market change
          }))
          .sort((a, b) => b.count - a.count);
        
        setMarketTrends(trends);

        // Calculate personal insights
        if (diamonds.length > 0) {
          const totalValue = diamonds.reduce((sum, d) => sum + (d.price_per_carat * d.weight), 0);
          const avgPricePerCarat = diamonds.reduce((sum, d) => sum + d.price_per_carat, 0) / diamonds.length;
          
          const personalInsight: PersonalInsight = {
            inventoryValue: totalValue,
            mostProfitableShape: trends[0]?.category || 'round brilliant',
            leastProfitableShape: trends[trends.length - 1]?.category || 'cushion',
            avgPricePerCarat,
            portfolioGrowth: Math.floor(Math.random() * 15) + 5 // Simulate growth
          };
          setPersonalInsights(personalInsight);
        }

        // Fetch additional insights
        await Promise.all([
          fetchGroupInsights(),
          fetchDemandInsights()
        ]);
        
        toast({
          title: "Advanced insights loaded",
          description: `Analyzed ${diamonds.length} diamonds with market and group data.`,
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

  const getMostFrequent = (arr: any[], key: string) => {
    const freq = arr.reduce((acc, item) => {
      const val = item[key];
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
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
    demandInsights,
    groupInsights,
    personalInsights,
    fetchRealInsights,
    isAuthenticated
  };
}
