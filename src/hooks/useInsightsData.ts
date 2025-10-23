
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

interface Diamond {
  id: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  price_per_carat: number;
  created_at: string;
  owners?: number[];
  owner_id?: number;
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
      } else {
        setGroupInsights(null);
      }
    } catch (error) {
      console.error('Failed to fetch group insights:', error);
      setGroupInsights(null);
    }
  };

  const fetchRealInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching real insights for user:', user.id);
      
      // Get user's diamonds
      const response = await api.get<Diamond[]>(apiEndpoints.getAllStones(user.id));
      
      if (response.data && response.data.length > 0) {
        const diamonds = response.data.filter(d => 
          d.owners?.includes(user.id) || d.owner_id === user.id
        );
        
        if (diamonds.length === 0) {
          setTotalDiamonds(0);
          setMarketTrends([]);
          setDemandInsights([]);
          setPersonalInsights(null);
          toast({
            title: "No diamonds found",
            description: "Upload your inventory to see insights.",
          });
          return;
        }
        
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
            percentage: Math.round((count / diamonds.length) * 100),
            change: 0 // Would need historical data for real change
          }))
          .sort((a, b) => b.count - a.count);
        
        setMarketTrends(trends);

        // Generate real demand insights from actual inventory
        const demandData: DemandInsight[] = trends.slice(0, 5).map(trend => {
          const shapeDiamonds = diamonds.filter(d => d.shape === trend.category);
          const avgPrice = shapeDiamonds.reduce((sum, d) => sum + (d.price_per_carat || 0), 0) / shapeDiamonds.length;
          const mostCommonColor = getMostFrequent(shapeDiamonds, 'color') || 'G';
          const mostCommonClarity = getMostFrequent(shapeDiamonds, 'clarity') || 'VS1';
          
          return {
            shape: trend.category,
            color: mostCommonColor,
            clarity: mostCommonClarity,
            demandLevel: trend.percentage > 30 ? 'high' : trend.percentage > 15 ? 'medium' : 'low',
            searchCount: 0, // Would need actual search data
            avgPrice
          };
        });
        
        setDemandInsights(demandData);

        // Calculate real personal insights with realistic bounds
        if (diamonds.length > 0) {
          // Calculate total value using safe price calculations
          const totalValue = diamonds.reduce((sum, d) => {
            const weight = Number(d.weight) || 0;
            const rawPpc = Number(d.price_per_carat) || 0;
            
            // Only use PPC if it's in reasonable range (100-50000 per carat)
            // Calculate actual diamond value from FastAPI data
            let diamondValue = 0;
            if (rawPpc > 100 && rawPpc < 50000 && weight > 0 && weight < 20) {
              diamondValue = rawPpc * weight;
            } else if (rawPpc > 0) {
              // Treat as total price
              diamondValue = rawPpc;  
            } else {
              diamondValue = 0;
            }
            
            return sum + diamondValue;
          }, 0);
          
          // Calculate average price per carat from realistic values only
          const validDiamonds = diamonds.filter(d => {
            const weight = Number(d.weight) || 0;
            const rawPpc = Number(d.price_per_carat) || 0;
            return weight > 0 && weight < 20 && rawPpc > 100 && rawPpc < 50000;
          });
          
          const avgPricePerCarat = validDiamonds.length > 0 
            ? validDiamonds.reduce((sum, d) => sum + Number(d.price_per_carat), 0) / validDiamonds.length
            : 0;
          
          const personalInsight: PersonalInsight = {
            inventoryValue: totalValue,
            mostProfitableShape: trends[0]?.category || 'round brilliant',
            leastProfitableShape: trends[trends.length - 1]?.category || 'cushion',
            avgPricePerCarat,
            portfolioGrowth: 0 // Would need historical data for real growth
          };
          setPersonalInsights(personalInsight);
        }

        // Fetch group insights
        await fetchGroupInsights();
        
        toast({
          title: "Insights loaded",
          description: `Analyzed ${diamonds.length} diamonds from your real inventory.`,
        });
      } else {
        console.log('No diamonds found for user');
        setTotalDiamonds(0);
        setMarketTrends([]);
        setDemandInsights([]);
        setPersonalInsights(null);
        setGroupInsights(null);
      }
    } catch (error) {
      console.error("Failed to fetch insights", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load insights. Please try again.",
      });
      setTotalDiamonds(0);
      setMarketTrends([]);
      setDemandInsights([]);
      setPersonalInsights(null);
      setGroupInsights(null);
    } finally {
      setLoading(false);
    }
  };

  const getMostFrequent = (arr: any[], key: string) => {
    if (!arr || arr.length === 0) return null;
    
    const freq = arr.reduce((acc, item) => {
      const val = item[key];
      if (val) {
        acc[val] = (acc[val] || 0) + 1;
      }
      return acc;
    }, {});
    
    const entries = Object.entries(freq);
    if (entries.length === 0) return null;
    
    return entries.reduce((a, b) => freq[a[0]] > freq[b[0]] ? a : b)[0];
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRealInsights();
    } else {
      setLoading(false);
      setTotalDiamonds(0);
      setMarketTrends([]);
      setDemandInsights([]);
      setPersonalInsights(null);
      setGroupInsights(null);
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
